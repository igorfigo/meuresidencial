import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { useToast } from './use-toast';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SupabaseRPCTypes } from '@/integrations/supabase/rpc-types';

// Document attachment type
export interface BusinessDocumentAttachment {
  id: string;
  document_id: string;
  file_path: string;
  file_type: string;
  file_name: string;
  created_at: string;
}

// Form validation schema
const documentSchema = z.object({
  id: z.string().optional(),
  tipo: z.string().min(1, "Tipo do documento é obrigatório"),
  data_cadastro: z.string().min(1, "Data é obrigatória"),
  observacoes: z.string().min(1, "Observações são obrigatórias"),
});

export type BusinessDocumentFormValues = z.infer<typeof documentSchema>;

export function useBusinessDocuments() {
  const { toast } = useToast();
  const { user } = useApp();
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<BusinessDocumentAttachment[]>([]);
  
  const form = useForm<BusinessDocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      tipo: '',
      data_cadastro: format(new Date(), 'yyyy-MM-dd'),
      observacoes: '',
    }
  });
  
  // Fetch documents
  const fetchDocuments = async () => {
    if (!user?.isAdmin) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('business_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching business documents:', error);
      toast({
        title: 'Erro ao carregar documentos',
        description: 'Não foi possível carregar os documentos de negócio.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch document attachments
  const fetchAttachments = async (documentId: string): Promise<BusinessDocumentAttachment[]> => {
    try {
      const { data, error } = await supabase
        .from('business_document_attachments')
        .select('*')
        .eq('document_id', documentId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  };
  
  // Reset form
  const resetForm = (document?: any) => {
    setAttachments([]);
    
    if (document?.id) {
      form.reset({
        id: document.id,
        tipo: document.tipo,
        data_cadastro: document.data_cadastro || format(new Date(), 'yyyy-MM-dd'),
        observacoes: document.observacoes,
      });
      
      // Fetch existing attachments for edit mode
      fetchExistingAttachments(document.id);
    } else {
      form.reset({
        tipo: '',
        data_cadastro: format(new Date(), 'yyyy-MM-dd'),
        observacoes: '',
      });
      setExistingAttachments([]);
    }
  };
  
  // Fetch existing attachments for a document
  const fetchExistingAttachments = async (documentId: string) => {
    try {
      const attachments = await fetchAttachments(documentId);
      setExistingAttachments(attachments);
    } catch (error) {
      console.error('Error fetching existing attachments:', error);
    }
  };
  
  // Submit form
  const onSubmit = async (data: BusinessDocumentFormValues) => {
    if (!user?.isAdmin) return;
    
    // Check if there are either new attachments or existing attachments (for edit)
    if (attachments.length === 0 && existingAttachments.length === 0) {
      toast({
        title: "Erro ao salvar documento",
        description: "É necessário anexar pelo menos um arquivo.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Save or update document
      let documentId = data.id;
      
      if (documentId) {
        // Update existing document
        const { error } = await supabase
          .from('business_documents')
          .update({
            tipo: data.tipo,
            data_cadastro: data.data_cadastro,
            observacoes: data.observacoes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', documentId);
        
        if (error) throw error;
      } else {
        // Create new document
        const { data: newDocument, error } = await supabase
          .from('business_documents')
          .insert({
            tipo: data.tipo,
            data_cadastro: data.data_cadastro,
            observacoes: data.observacoes,
          })
          .select();
        
        if (error) throw error;
        documentId = newDocument[0].id;
      }
      
      // Handle file uploads if there are any
      if (attachments.length > 0) {
        setIsUploading(true);
        
        try {
          // Check if the bucket exists
          const { data: buckets } = await supabase.storage.listBuckets();
          console.log('Available buckets:', buckets);
          
          const bucketExists = buckets?.some(bucket => bucket.name === 'business_files');
          
          // If bucket doesn't exist, create it
          if (!bucketExists) {
            console.log('Bucket does not exist, attempting to create it...');
            
            // Try to create the bucket (may need admin privileges)
            try {
              const { error } = await supabase.rpc<
                SupabaseRPCTypes['create_storage_bucket']['args'],
                SupabaseRPCTypes['create_storage_bucket']['returns']
              >(
                'create_storage_bucket',
                {
                  bucket_name: 'business_files',
                  bucket_public: true
                }
              );
              
              if (error) throw error;
              console.log('Bucket created successfully');
            } catch (error) {
              console.error('Failed to create bucket. Using fallback method.', error);
              throw new Error("Storage bucket 'business_files' does not exist and couldn't be created. Please contact the administrator.");
            }
          }
          
          for (let i = 0; i < attachments.length; i++) {
            const file = attachments[i];
            const filePath = `business/${documentId}/${file.name}`;
            
            console.log(`Uploading file ${i+1}/${attachments.length}: ${filePath}`);
            
            // Upload file to storage with public-read access
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('business_files')
              .upload(filePath, file, {
                upsert: true,
                cacheControl: '3600'
              });
            
            if (uploadError) {
              console.error('Error uploading file:', uploadError);
              throw uploadError;
            }
            
            console.log('File uploaded successfully:', uploadData);
            
            // Save attachment record in database
            const { error: attachmentError } = await supabase
              .from('business_document_attachments')
              .insert({
                document_id: documentId,
                file_path: filePath,
                file_type: file.type,
                file_name: file.name,
              });
            
            if (attachmentError) {
              console.error('Error saving attachment record:', attachmentError);
              throw attachmentError;
            }
            
            // Update progress
            setUploadProgress(Math.round(((i + 1) / attachments.length) * 100));
          }
        } catch (error) {
          console.error('Error with storage bucket:', error);
          throw error;
        } finally {
          setIsUploading(false);
        }
      }
      
      toast({
        title: documentId === data.id ? 'Documento atualizado' : 'Documento cadastrado',
        description: 'As informações foram salvas com sucesso.',
      });
      
      // Refresh documents list
      fetchDocuments();
      resetForm();
    } catch (error) {
      console.error('Error saving business document:', error);
      toast({
        title: 'Erro ao salvar documento',
        description: 'Não foi possível salvar as informações. Detalhes: ' + (error instanceof Error ? error.message : 'Erro desconhecido'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };
  
  // Delete document
  const deleteDocument = async (id: string) => {
    setIsDeleting(true);
    
    try {
      // Delete document (attachments and files will be deleted via cascade)
      const { error } = await supabase
        .from('business_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Documento excluído',
        description: 'O documento foi excluído com sucesso.',
      });
      
      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Erro ao excluir documento',
        description: 'Não foi possível excluir o documento.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileList = event.target.files;
      const filesArray = Array.from(fileList);
      setAttachments(prev => [...prev, ...filesArray]);
    }
  };
  
  // Remove file from attachments
  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Remove existing attachment
  const removeExistingAttachment = async (id: string) => {
    try {
      // Find attachment to get file path
      const attachment = existingAttachments.find(a => a.id === id);
      if (!attachment) return;
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('business_files')
        .remove([attachment.file_path]);
      
      if (storageError) throw storageError;
      
      // Delete attachment record
      const { error } = await supabase
        .from('business_document_attachments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update existing attachments list
      setExistingAttachments(prev => prev.filter(a => a.id !== id));
      
      toast({
        title: 'Anexo removido',
        description: 'O anexo foi removido com sucesso.',
      });
    } catch (error) {
      console.error('Error removing attachment:', error);
      toast({
        title: 'Erro ao remover anexo',
        description: 'Não foi possível remover o anexo.',
        variant: 'destructive',
      });
    }
  };
  
  // Get file URL
  const getFileUrl = async (path: string) => {
    try {
      const { data } = await supabase.storage
        .from('business_files')
        .createSignedUrl(path, 60); // 60 seconds expiry
      
      return data?.signedUrl || '';
    } catch (error) {
      console.error('Error getting file URL:', error);
      return '';
    }
  };
  
  // Fetch documents on mount
  useEffect(() => {
    if (user?.isAdmin) {
      fetchDocuments();
    }
  }, [user?.isAdmin]);
  
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
}
