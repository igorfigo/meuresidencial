
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { format } from 'date-fns';

export interface BusinessDocumentAttachment {
  id: string;
  document_id: string;
  file_path: string;
  file_type: string;
  file_name: string;
  created_at: string;
}

export interface BusinessDocument {
  id: string;
  tipo: string;
  data_cadastro: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessDocumentFormValues {
  tipo: string;
  data_cadastro: string;
  observacoes?: string;
}

export function useBusinessDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch business documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['businessDocuments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as BusinessDocument[];
    },
  });

  // Create document mutation
  const createDocument = useMutation({
    mutationFn: async ({ 
      values, 
      attachments 
    }: { 
      values: BusinessDocumentFormValues; 
      attachments: File[] 
    }) => {
      // Insert document
      const { data, error } = await supabase
        .from('business_documents')
        .insert({
          tipo: values.tipo,
          data_cadastro: values.data_cadastro,
          observacoes: values.observacoes,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        throw error;
      }

      // Upload attachments if any
      if (attachments.length > 0) {
        setIsUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < attachments.length; i++) {
          const file = attachments[i];
          const filePath = `business_documents/${data.id}/${file.name}`;

          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from('business_document_files')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
          }

          // Create attachment record
          const { error: attachmentError } = await supabase
            .from('business_document_attachments')
            .insert({
              document_id: data.id,
              file_path: filePath,
              file_type: file.type,
              file_name: file.name,
            });

          if (attachmentError) {
            console.error('Error creating attachment record:', attachmentError);
            throw attachmentError;
          }

          // Update progress
          setUploadProgress(Math.round(((i + 1) / attachments.length) * 100));
        }

        setIsUploading(false);
      }

      return data;
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: 'Erro ao salvar documento',
        description: 'Não foi possível salvar o documento. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Documento salvo',
        description: 'O documento foi salvo com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['businessDocuments'] });
    },
  });

  // Update document mutation
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
      // Update document
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error updating document:', error);
        throw error;
      }

      // Upload attachments if any
      if (attachments.length > 0) {
        setIsUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < attachments.length; i++) {
          const file = attachments[i];
          const filePath = `business_documents/${id}/${file.name}`;

          // Upload file
          const { error: uploadError } = await supabase.storage
            .from('business_document_files')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
          }

          // Create attachment record
          const { error: attachmentError } = await supabase
            .from('business_document_attachments')
            .insert({
              document_id: id,
              file_path: filePath,
              file_type: file.type,
              file_name: file.name,
            });

          if (attachmentError) {
            console.error('Error creating attachment record:', attachmentError);
            throw attachmentError;
          }

          // Update progress
          setUploadProgress(Math.round(((i + 1) / attachments.length) * 100));
        }

        setIsUploading(false);
      }

      return data;
    },
    onError: (error) => {
      console.error('Error in updateDocument:', error);
      toast({
        title: 'Erro ao atualizar documento',
        description: 'Não foi possível atualizar o documento. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Documento atualizado',
        description: 'O documento foi atualizado com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['businessDocuments'] });
    },
  });

  // Delete document mutation
  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      // Delete document (attachments will be deleted via cascade)
      const { error } = await supabase
        .from('business_documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting document:', error);
        throw error;
      }

      // TODO: Delete files from storage
      // This would require fetching attachments first and then deleting files one by one
      return id;
    },
    onError: (error) => {
      console.error('Error in deleteDocument:', error);
      toast({
        title: 'Erro ao excluir documento',
        description: 'Não foi possível excluir o documento. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Documento excluído',
        description: 'O documento foi excluído com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['businessDocuments'] });
    },
  });

  // Fetch document attachments
  const fetchDocumentAttachments = async (documentId: string) => {
    const { data, error } = await supabase
      .from('business_document_attachments')
      .select('*')
      .eq('document_id', documentId);

    if (error) {
      console.error('Error fetching attachments:', error);
      throw error;
    }

    return data as BusinessDocumentAttachment[];
  };

  // Delete attachment mutation
  const deleteAttachment = useMutation({
    mutationFn: async (attachment: BusinessDocumentAttachment) => {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('business_document_files')
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
        console.error('Error deleting attachment record:', error);
        throw error;
      }

      return attachment;
    },
    onError: (error) => {
      console.error('Error in deleteAttachment:', error);
      toast({
        title: 'Erro ao excluir anexo',
        description: 'Não foi possível excluir o anexo. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Anexo excluído',
        description: 'O anexo foi excluído com sucesso.',
      });
    },
  });

  // Get file URL
  const getFileUrl = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('business_document_files')
        .createSignedUrl(path, 60); // 60 seconds expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return '';
    }
  };

  return {
    documents,
    isLoading,
    createDocument,
    updateDocument,
    deleteDocument,
    fetchDocumentAttachments,
    deleteAttachment,
    getFileUrl,
    isUploading,
    uploadProgress,
  };
}
