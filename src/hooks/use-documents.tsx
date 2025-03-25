import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

export const useDocuments = (
  documentType: 'documents' | 'business_documents' = 'documents',
  initialData?: any
) => {
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);

  // Get the appropriate attachments table name based on document type
  const getAttachmentsTable = () => {
    return documentType === 'business_documents' ? 'business_document_attachments' : 'document_attachments';
  };

  // Form definition with zod schema
  const formSchema = z.object({
    id: z.string().optional(),
    tipo: z.string().min(2, {
      message: "Tipo é obrigatório e deve ter pelo menos 2 caracteres",
    }),
    data_cadastro: z.string().min(1, {
      message: "Data é obrigatória",
    }),
    observacoes: z.string().optional(),
    matricula: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      tipo: "",
      data_cadastro: format(new Date(), 'yyyy-MM-dd'),
      observacoes: "",
      matricula: user?.selectedCondominium || "",
    },
  });

  const queryClient = supabase.realtime.postgrestClient();

  // Query to get documents
  const { data: documents, refetch: refetchDocuments } = useQuery({
    queryKey: [documentType, user?.selectedCondominium],
    queryFn: async () => {
      try {
        const matricula = user?.selectedCondominium;
        if (!matricula) return [];

        const { data, error } = await supabase
          .from(documentType)
          .select("*")
          .eq("matricula", matricula)
          .order("data_cadastro", { ascending: false });

        if (error) {
          console.error(`Error fetching ${documentType}:`, error);
          toast.error(`Erro ao carregar documentos: ${error.message}`);
          return [];
        }

        return data;
      } catch (error) {
        console.error(`Error in ${documentType} query:`, error);
        toast.error("Erro ao carregar documentos");
        return [];
      }
    },
    enabled: !!user?.selectedCondominium,
  });

  // Fetch document attachments
  const fetchAttachments = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from(getAttachmentsTable())
        .select("*")
        .eq("document_id", documentId);

      if (error) {
        console.error("Error fetching attachments:", error);
        toast.error(`Erro ao carregar anexos: ${error.message}`);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Error in fetchAttachments:", error);
      toast.error("Erro ao carregar anexos");
      return [];
    }
  };

  // Reset form
  const resetForm = (initialValues?: any) => {
    if (initialValues) {
      form.reset({
        id: initialValues.id,
        tipo: initialValues.tipo,
        data_cadastro: initialValues.data_cadastro,
        observacoes: initialValues.observacoes || "",
        matricula: initialValues.matricula,
      });

      // Fetch existing attachments if editing
      if (initialValues.id) {
        fetchAttachments(initialValues.id).then(attachments => {
          setExistingAttachments(attachments || []);
        });
      }
    } else {
      form.reset({
        tipo: "",
        data_cadastro: format(new Date(), 'yyyy-MM-dd'),
        observacoes: "",
        matricula: user?.selectedCondominium || "",
      });
      setAttachments([]);
      setExistingAttachments([]);
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing attachment
  const removeExistingAttachment = async (id: string) => {
    try {
      // First get the attachment to get the file path
      const { data, error: fetchError } = await supabase
        .from(getAttachmentsTable())
        .select("file_path")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching attachment:", fetchError);
        toast.error(`Erro ao remover anexo: ${fetchError.message}`);
        return;
      }

      // Delete the file from storage
      if (data && data.file_path) {
        const { error: storageError } = await supabase.storage
          .from(documentType)
          .remove([data.file_path.split('/').pop()!]);

        if (storageError) {
          console.error("Error removing file from storage:", storageError);
          // Continue anyway to delete the record
        }
      }

      // Delete the attachment record
      const { error } = await supabase
        .from(getAttachmentsTable())
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting attachment:", error);
        toast.error(`Erro ao remover anexo: ${error.message}`);
        return;
      }

      // Update the UI
      setExistingAttachments(prev => prev.filter(attachment => attachment.id !== id));
      toast.success("Anexo removido com sucesso");
    } catch (error) {
      console.error("Error in removeExistingAttachment:", error);
      toast.error("Erro ao remover anexo");
    }
  };

  // Get file URL
  const getFileUrl = async (path: string) => {
    try {
      const fileName = path.split('/').pop();
      if (!fileName) return null;

      const { data, error } = await supabase.storage
        .from(documentType)
        .createSignedUrl(fileName, 60);

      if (error) {
        console.error("Error getting file URL:", error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error("Error in getFileUrl:", error);
      return null;
    }
  };

  // Upload files
  const uploadFiles = async (documentId: string) => {
    if (attachments.length === 0) return [];

    setIsUploading(true);
    setUploadProgress(0);

    const uploadedAttachments = [];
    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      const fileName = `${documentId}_${Date.now()}_${file.name}`;

      try {
        // Upload file to storage
        const { data, error } = await supabase.storage
          .from(documentType)
          .upload(fileName, file);

        if (error) {
          console.error("Error uploading file:", error);
          toast.error(`Erro ao fazer upload do arquivo ${file.name}`);
          continue;
        }

        // Create attachment record
        const { data: attachmentData, error: attachmentError } = await supabase
          .from(getAttachmentsTable())
          .insert({
            document_id: documentId,
            file_name: file.name,
            file_type: file.type,
            file_path: data?.path || fileName,
          })
          .select("*")
          .single();

        if (attachmentError) {
          console.error("Error creating attachment record:", attachmentError);
          toast.error(`Erro ao registrar anexo ${file.name}`);
          continue;
        }

        uploadedAttachments.push(attachmentData);
        // Update progress
        setUploadProgress(Math.round((i + 1) / attachments.length * 100));
      } catch (error) {
        console.error("Error in file upload:", error);
        toast.error(`Erro ao processar arquivo ${file.name}`);
      }
    }

    setIsUploading(false);
    setAttachments([]);
    return uploadedAttachments;
  };

  // Submit document
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.selectedCondominium) {
      toast.error("Selecione um condomínio");
      return;
    }

    try {
      setIsSubmitting(true);
      const isEditing = !!values.id;
      
      // Ensure matricula is set
      values.matricula = user.selectedCondominium;

      let documentId;
      if (isEditing) {
        // Update existing document
        const { data, error } = await supabase
          .from(documentType)
          .update({
            tipo: values.tipo,
            data_cadastro: values.data_cadastro,
            observacoes: values.observacoes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", values.id)
          .select("*")
          .single();

        if (error) {
          console.error("Error updating document:", error);
          toast.error(`Erro ao atualizar documento: ${error.message}`);
          return;
        }

        documentId = data.id;
        toast.success("Documento atualizado com sucesso");
      } else {
        // Create new document
        const { data, error } = await supabase
          .from(documentType)
          .insert({
            tipo: values.tipo,
            data_cadastro: values.data_cadastro,
            observacoes: values.observacoes,
            matricula: values.matricula,
          })
          .select("*")
          .single();

        if (error) {
          console.error("Error creating document:", error);
          toast.error(`Erro ao criar documento: ${error.message}`);
          return;
        }

        documentId = data.id;
        toast.success("Documento criado com sucesso");
      }

      // Upload attachments
      if (documentId && attachments.length > 0) {
        await uploadFiles(documentId);
      }

      // Refetch documents
      refetchDocuments();
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Erro ao salvar documento");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete document
  const deleteDocument = async (id: string) => {
    try {
      setIsDeleting(true);

      // First get all attachments to delete files from storage
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from(getAttachmentsTable())
        .select("file_path")
        .eq("document_id", id);

      if (!attachmentsError && attachmentsData && attachmentsData.length > 0) {
        // Delete files from storage
        const filesToDelete = attachmentsData.map(att => 
          att.file_path.split('/').pop()!
        );

        if (filesToDelete.length > 0) {
          await supabase.storage
            .from(documentType)
            .remove(filesToDelete);
        }
      }

      // Delete document (attachments will be deleted by cascade)
      const { error } = await supabase
        .from(documentType)
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting document:", error);
        toast.error(`Erro ao excluir documento: ${error.message}`);
        return;
      }

      toast.success("Documento excluído com sucesso");
      refetchDocuments();
    } catch (error) {
      console.error("Error in deleteDocument:", error);
      toast.error("Erro ao excluir documento");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    form,
    documents,
    isLoading: !documents,
    resetForm,
    onSubmit,
    deleteDocument,
    isSubmitting,
    isDeleting,
    attachments,
    existingAttachments,
    handleFileChange,
    removeFile,
    removeExistingAttachment,
    getFileUrl,
    uploadProgress,
    isUploading,
    fetchDocuments: refetchDocuments,
    fetchAttachments,
  };
};
