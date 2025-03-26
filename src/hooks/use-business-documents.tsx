
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface BusinessDocumentAttachment {
  id: string;
  document_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

export interface BusinessDocument {
  id: string;
  tipo: string;
  data_cadastro: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessDocumentFormValues {
  tipo: string;
  data_cadastro: string;
  observacoes: string;
}

export const useBusinessDocuments = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch all business documents
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['business-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching business documents:', error);
        throw error;
      }

      return data as BusinessDocument[];
    },
  });

  // Fetch document attachments
  const fetchDocumentAttachments = async (documentId: string) => {
    const { data, error } = await supabase
      .from('business_document_attachments')
      .select('*')
      .eq('document_id', documentId);

    if (error) {
      console.error('Error fetching document attachments:', error);
      throw error;
    }

    return data as BusinessDocumentAttachment[];
  };

  // Create a new document
  const createDocument = useMutation({
    mutationFn: async ({ 
      values, 
      attachments 
    }: { 
      values: BusinessDocumentFormValues; 
      attachments: File[] 
    }) => {
      try {
        // Insert document
        const { data: document, error: documentError } = await supabase
          .from('business_documents')
          .insert({
            tipo: values.tipo,
            data_cadastro: values.data_cadastro,
            observacoes: values.observacoes,
          })
          .select()
          .single();

        if (documentError) {
          console.error('Error creating document:', documentError);
          throw documentError;
        }

        // Upload attachments if any
        if (attachments.length > 0) {
          setIsUploading(true);
          
          for (let i = 0; i < attachments.length; i++) {
            const file = attachments[i];
            const fileExt = file.name.split('.').pop();
            const filePath = `business-documents/${document.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            // Upload file to storage
            const { error: uploadError } = await supabase.storage
              .from('documents')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              console.error('Error uploading file:', uploadError);
              throw uploadError;
            }

            // Create attachment record
            const { error: attachmentError } = await supabase
              .from('business_document_attachments')
              .insert({
                document_id: document.id,
                file_name: file.name,
                file_path: filePath,
                file_type: file.type,
              });

            if (attachmentError) {
              console.error('Error creating attachment record:', attachmentError);
              throw attachmentError;
            }

            // Update progress
            setUploadProgress(Math.round(((i + 1) / attachments.length) * 100));
          }
          
          setIsUploading(false);
          setUploadProgress(0);
        }

        return document;
      } catch (error) {
        console.error('Error in createDocument:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-documents'] });
      toast.success('Documento criado com sucesso!');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao criar documento.');
    },
  });

  // Update an existing document
  const updateDocument = useMutation({
    mutationFn: async ({ 
      id, 
      values, 
      attachments 
    }: { 
      id: string; 
      values: BusinessDocumentFormValues; 
      attachments: File[] 
    }) => {
      try {
        // Update document
        const { data: document, error: documentError } = await supabase
          .from('business_documents')
          .update({
            tipo: values.tipo,
            data_cadastro: values.data_cadastro,
            observacoes: values.observacoes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (documentError) {
          console.error('Error updating document:', documentError);
          throw documentError;
        }

        // Upload attachments if any
        if (attachments.length > 0) {
          setIsUploading(true);
          
          for (let i = 0; i < attachments.length; i++) {
            const file = attachments[i];
            const fileExt = file.name.split('.').pop();
            const filePath = `business-documents/${document.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            // Upload file to storage
            const { error: uploadError } = await supabase.storage
              .from('documents')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              console.error('Error uploading file:', uploadError);
              throw uploadError;
            }

            // Create attachment record
            const { error: attachmentError } = await supabase
              .from('business_document_attachments')
              .insert({
                document_id: document.id,
                file_name: file.name,
                file_path: filePath,
                file_type: file.type,
              });

            if (attachmentError) {
              console.error('Error creating attachment record:', attachmentError);
              throw attachmentError;
            }

            // Update progress
            setUploadProgress(Math.round(((i + 1) / attachments.length) * 100));
          }
          
          setIsUploading(false);
          setUploadProgress(0);
        }

        return document;
      } catch (error) {
        console.error('Error in updateDocument:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-documents'] });
      toast.success('Documento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao atualizar documento.');
    },
  });

  // Delete a document
  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      // First get all attachments to delete from storage
      const attachments = await fetchDocumentAttachments(id);
      
      // Delete all files from storage
      for (const attachment of attachments) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([attachment.file_path]);
          
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with other files even if one fails
        }
      }
      
      // Delete document (will cascade delete attachments due to FK constraint)
      const { error } = await supabase
        .from('business_documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting document:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-documents'] });
      toast.success('Documento excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao excluir documento.');
    },
  });

  // Delete an attachment
  const deleteAttachment = useMutation({
    mutationFn: async (attachment: BusinessDocumentAttachment) => {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([attachment.file_path]);
        
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        throw storageError;
      }
      
      // Delete attachment record
      const { error } = await supabase
        .from('business_document_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) {
        console.error('Error deleting attachment:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['business-document-attachments', variables.document_id] 
      });
      toast.success('Anexo excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao excluir anexo.');
    },
  });

  // Get a signed URL for downloading a file
  const getFileUrl = async (path: string) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, 60);

    if (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }

    return data.signedUrl;
  };

  return {
    documents,
    isLoading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    fetchDocumentAttachments,
    deleteAttachment,
    getFileUrl,
    isUploading,
    uploadProgress,
  };
};
