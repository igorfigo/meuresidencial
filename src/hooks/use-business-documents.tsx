import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Type definitions
export interface BusinessDocument {
  id?: string;
  matricula: string;
  tipo: string;
  data_cadastro: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessDocumentAttachment {
  id: string;
  document_id: string;
  file_path: string;
  file_type: string;
  file_name: string;
  created_at?: string;
}

// Form schema for business documents
const businessDocumentSchema = z.object({
  id: z.string().optional(),
  matricula: z.string(),
  tipo: z.string(),
  data_cadastro: z.string(),
  observacoes: z.string().optional(),
});

export type BusinessDocumentFormValues = z.infer<typeof businessDocumentSchema>;

export const useBusinessDocuments = () => {
  const { user } = useApp();
  const [documents, setDocuments] = useState<BusinessDocument[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // File upload state
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<BusinessDocumentAttachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Initialize form
  const form = useForm<BusinessDocumentFormValues>({
    resolver: zodResolver(businessDocumentSchema),
    defaultValues: {
      matricula: user?.matricula || '',
      tipo: '',
      data_cadastro: new Date().toISOString().split('T')[0],
      observacoes: '',
    },
  });

  // Reset form with optional initial data
  const resetForm = (initialData?: BusinessDocument) => {
    if (initialData) {
      // Format date to YYYY-MM-DD
      const formattedDate = initialData.data_cadastro.split('T')[0];
      
      form.reset({
        id: initialData.id,
        matricula: initialData.matricula,
        tipo: initialData.tipo,
        data_cadastro: formattedDate,
        observacoes: initialData.observacoes || '',
      });
      
      // Fetch existing attachments for this document
      fetchAttachments(initialData.id!);
    } else {
      form.reset({
        matricula: user?.matricula || '',
        tipo: '',
        data_cadastro: new Date().toISOString().split('T')[0],
        observacoes: '',
      });
      setAttachments([]);
      setExistingAttachments([]);
    }
  };

  // Fetch business documents
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.matricula) {
        setDocuments([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('business_documents')
        .select('*')
        .eq('matricula', user.matricula)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching business documents:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attachments for a document
  const fetchAttachments = async (documentId: string): Promise<BusinessDocumentAttachment[]> => {
    try {
      const { data, error } = await supabase
        .from('business_document_attachments')
        .select('*')
        .eq('document_id', documentId);
      
      if (error) throw error;
      
      setExistingAttachments(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Remove existing attachment
  const removeExistingAttachment = async (id: string) => {
    try {
      // First get the attachment to get the file path
      const { data: attachmentData, error: fetchError } = await supabase
        .from('business_document_attachments')
        .select('file_path')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete from storage
      const filePath = attachmentData.file_path;
      const { error: storageError } = await supabase.storage.from('documents').remove([filePath]);
      
      if (storageError) {
        console.error('Error removing file from storage:', storageError);
      }
      
      // Delete from database
      const { error: deleteError } = await supabase
        .from('business_document_attachments')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Update state
      setExistingAttachments(existingAttachments.filter(attachment => attachment.id !== id));
      toast.success('Anexo removido com sucesso');
    } catch (error) {
      console.error('Error removing attachment:', error);
      toast.error('Erro ao remover anexo');
    }
  };

  // Get download URL for a file
  const getFileUrl = async (path: string): Promise<string> => {
    try {
      const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 60);
      
      if (error) throw error;
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  };

  // Upload files and save document
  const onSubmit = async (data: BusinessDocumentFormValues) => {
    try {
      setIsSubmitting(true);
      setIsUploading(attachments.length > 0);
      
      // Create or update document
      const isEditing = !!data.id;
      let documentId = data.id;
      
      if (isEditing) {
        // Update existing document
        const { error } = await supabase
          .from('business_documents')
          .update({
            tipo: data.tipo,
            data_cadastro: data.data_cadastro,
            observacoes: data.observacoes,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId);
        
        if (error) throw error;
      } else {
        // Insert new document
        const { data: newDocument, error } = await supabase
          .from('business_documents')
          .insert({
            matricula: user?.matricula,
            tipo: data.tipo,
            data_cadastro: data.data_cadastro,
            observacoes: data.observacoes,
          })
          .select();
        
        if (error) throw error;
        
        documentId = newDocument[0].id;
      }
      
      // Upload attachments if any
      if (attachments.length > 0) {
        for (let i = 0; i < attachments.length; i++) {
          const file = attachments[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${user?.matricula}/${documentId}/${fileName}`;
          
          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);
          
          if (uploadError) throw uploadError;
          
          // Save attachment record in database
          const { error: attachmentError } = await supabase
            .from('business_document_attachments')
            .insert({
              document_id: documentId,
              file_path: filePath,
              file_type: file.type,
              file_name: file.name,
            });
          
          if (attachmentError) throw attachmentError;
          
          // Update progress
          setUploadProgress(((i + 1) / attachments.length) * 100);
        }
      }
      
      toast.success(isEditing ? 'Documento atualizado com sucesso!' : 'Documento salvo com sucesso!');
      
      // Refresh document list
      fetchDocuments();
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Erro ao salvar documento');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
      setAttachments([]);
    }
  };

  // Delete document
  const deleteDocument = async (id: string) => {
    try {
      setIsDeleting(true);
      
      // First get all attachments to delete them from storage
      const { data: attachments, error: fetchError } = await supabase
        .from('business_document_attachments')
        .select('file_path')
        .eq('document_id', id);
      
      if (fetchError) throw fetchError;
      
      // Delete files from storage
      if (attachments && attachments.length > 0) {
        const filePaths = attachments.map(attachment => attachment.file_path);
        const { error: storageError } = await supabase.storage.from('documents').remove(filePaths);
        
        if (storageError) {
          console.error('Error removing files from storage:', storageError);
        }
      }
      
      // Delete document (cascade will delete attachments from the database)
      const { error } = await supabase
        .from('business_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Documento excluído com sucesso');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento');
    } finally {
      setIsDeleting(false);
    }
  };

  // Load documents on initial render
  useEffect(() => {
    fetchDocuments();
  }, [user?.matricula]);

  return {
    form,
    documents,
    isLoading,
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
    fetchDocuments,
    fetchAttachments
  };
};
