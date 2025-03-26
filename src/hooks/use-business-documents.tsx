
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

// Define the document schema
const documentSchema = z.object({
  id: z.string().optional(),
  tipo: z.string().min(1, { message: 'O tipo do documento é obrigatório' }),
  data_cadastro: z.date(),
  observacoes: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export function useBusinessDocuments() {
  const { user } = useApp();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize the form
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      tipo: '',
      data_cadastro: new Date(),
      observacoes: '',
    },
  });

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Function to fetch documents
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('business_documents')
        .select('*')
        .order('data_cadastro', { ascending: false });
      
      if (error) throw error;
      
      // Convert string dates to Date objects
      const formattedDocuments = data.map(doc => ({
        ...doc,
        data_cadastro: new Date(doc.data_cadastro),
      }));
      
      setDocuments(formattedDocuments);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error('Erro ao carregar documentos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attachments for a document
  const fetchAttachments = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_document_attachments')
        .select('*')
        .eq('document_id', documentId);
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error fetching attachments:', error);
      toast.error('Erro ao carregar anexos: ' + error.message);
      return [];
    }
  };

  // Reset form
  const resetForm = (document?: any) => {
    if (document) {
      form.reset({
        id: document.id,
        tipo: document.tipo,
        data_cadastro: new Date(document.data_cadastro),
        observacoes: document.observacoes || '',
      });
      
      // Fetch existing attachments
      fetchAttachments(document.id).then(attachments => {
        setExistingAttachments(attachments || []);
      });
    } else {
      form.reset({
        tipo: '',
        data_cadastro: new Date(),
        observacoes: '',
      });
      setExistingAttachments([]);
    }
    
    setAttachments([]);
  };

  // Handle file change
  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    setAttachments(prev => [...prev, ...newFiles]);
  };

  // Remove file
  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing attachment
  const removeExistingAttachment = async (attachmentId: string) => {
    try {
      const attachment = existingAttachments.find(att => att.id === attachmentId);
      
      if (attachment) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('business-documents')
          .remove([attachment.file_path]);
          
        if (storageError) throw storageError;
        
        // Delete from database
        const { error: dbError } = await supabase
          .from('business_document_attachments')
          .delete()
          .eq('id', attachmentId);
          
        if (dbError) throw dbError;
        
        // Update state
        setExistingAttachments(prev => prev.filter(att => att.id !== attachmentId));
        toast.success('Anexo removido com sucesso');
      }
    } catch (error: any) {
      console.error('Error removing attachment:', error);
      toast.error('Erro ao remover anexo: ' + error.message);
    }
  };

  // Get file URL
  const getFileUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('business-documents')
        .createSignedUrl(filePath, 60);
        
      if (error) throw error;
      
      return data.signedUrl;
    } catch (error: any) {
      console.error('Error getting file URL:', error);
      toast.error('Erro ao obter URL do arquivo: ' + error.message);
      return '';
    }
  };

  // Ensure bucket exists
  const ensureBucketExists = async () => {
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) throw bucketsError;
      
      const bucketExists = buckets.some(bucket => bucket.name === 'business-documents');
      
      if (!bucketExists) {
        console.log('Creating business-documents bucket...');
        // Create the bucket using rpc
        const { data, error } = await supabase.rpc('create_storage_bucket', {
          bucket_name: 'business-documents',
          bucket_public: true
        });
        
        if (error) throw error;
        
        console.log('Bucket created successfully:', data);
      }
    } catch (error: any) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  };

  // Upload files
  const uploadFiles = async (documentId: string) => {
    if (attachments.length === 0) return [];
    
    try {
      await ensureBucketExists();
      
      setIsUploading(true);
      setUploadProgress(0);
      
      const uploadedFiles = [];
      const totalFiles = attachments.length;
      
      for (let i = 0; i < attachments.length; i++) {
        const file = attachments[i];
        const filePath = `${documentId}/${Date.now()}_${file.name}`;
        
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('business-documents')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // Save file info to database
        const { data: attachmentData, error: attachmentError } = await supabase
          .from('business_document_attachments')
          .insert({
            document_id: documentId,
            file_name: file.name,
            file_type: file.type,
            file_path: filePath,
          })
          .select()
          .single();
          
        if (attachmentError) throw attachmentError;
        
        uploadedFiles.push(attachmentData);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      
      return uploadedFiles;
    } catch (error: any) {
      console.error('Error uploading files:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setAttachments([]);
    }
  };

  // Submit form
  const onSubmit = async (values: DocumentFormValues) => {
    try {
      setIsSubmitting(true);
      
      const isEditing = !!values.id;
      let documentId = values.id;
      
      if (isEditing) {
        // Update document
        const { error } = await supabase
          .from('business_documents')
          .update({
            tipo: values.tipo,
            observacoes: values.observacoes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', documentId);
          
        if (error) throw error;
      } else {
        // Insert new document
        const { data, error } = await supabase
          .from('business_documents')
          .insert({
            tipo: values.tipo,
            data_cadastro: values.data_cadastro.toISOString(),
            observacoes: values.observacoes,
          })
          .select()
          .single();
          
        if (error) throw error;
        
        documentId = data.id;
      }
      
      // Upload attachments
      if (attachments.length > 0) {
        await uploadFiles(documentId as string);
      }
      
      // Refresh documents list
      await fetchDocuments();
      
      toast.success(isEditing ? 'Documento atualizado com sucesso' : 'Documento criado com sucesso');
      resetForm();
    } catch (error: any) {
      console.error('Error submitting document:', error);
      toast.error('Erro ao salvar documento: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete document
  const deleteDocument = async (id: string) => {
    try {
      setIsDeleting(true);
      
      // Get attachments first
      const attachments = await fetchAttachments(id);
      
      // Delete attachments from storage
      if (attachments.length > 0) {
        const filePaths = attachments.map(att => att.file_path);
        
        const { error: storageError } = await supabase.storage
          .from('business-documents')
          .remove(filePaths);
          
        if (storageError) throw storageError;
        
        // Delete attachments from database
        const { error: attachmentsError } = await supabase
          .from('business_document_attachments')
          .delete()
          .eq('document_id', id);
          
        if (attachmentsError) throw attachmentsError;
      }
      
      // Delete document
      const { error } = await supabase
        .from('business_documents')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh documents list
      await fetchDocuments();
      
      toast.success('Documento excluído com sucesso');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

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
    fetchAttachments,
  };
}
