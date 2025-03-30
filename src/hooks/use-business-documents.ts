
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BusinessDocument {
  id: string;
  title: string;
  date: string;
  created_at: string;
  updated_at: string;
  attachments?: BusinessDocumentAttachment[];
}

export interface BusinessDocumentAttachment {
  id: string;
  document_id: string;
  file_path: string;
  file_type: string;
  file_name: string;
  created_at: string;
}

export const useBusinessDocuments = () => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['business-documents'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('business_documents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error fetching business documents:', error);
        toast.error('Erro ao buscar documentos.');
        return [];
      }
    }
  });

  const getDocumentAttachments = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_document_attachments')
        .select('*')
        .eq('document_id', documentId);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching document attachments:', error);
      return [];
    }
  };

  const createDocument = useMutation({
    mutationFn: async (document: Omit<BusinessDocument, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('business_documents')
          .insert(document)
          .select();

        if (error) throw error;
        
        return data[0];
      } catch (error) {
        console.error('Error creating business document:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-documents'] });
      toast.success('Documento criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar documento.');
    }
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('business_documents')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        return id;
      } catch (error) {
        console.error('Error deleting business document:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-documents'] });
      toast.success('Documento excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir documento.');
    }
  });

  const uploadAttachment = async (documentId: string, file: File) => {
    try {
      setIsUploading(true);
      
      // Create a unique file path
      const filePath = `business-documents/${documentId}/${file.name}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      // Create attachment record in the database
      const { error: attachmentError } = await supabase
        .from('business_document_attachments')
        .insert({
          document_id: documentId,
          file_path: filePath,
          file_type: file.type,
          file_name: file.name
        });

      if (attachmentError) throw attachmentError;
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['business-documents'] });
      
      toast.success('Arquivo anexado com sucesso!');
      return true;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast.error('Erro ao anexar arquivo.');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: string, filePath: string) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;
      
      // Delete record from database
      const { error: dbError } = await supabase
        .from('business_document_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['business-documents'] });
      
      toast.success('Anexo removido com sucesso!');
      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Erro ao remover anexo.');
      return false;
    }
  };

  return {
    documents,
    isLoading,
    isUploading,
    createDocument,
    deleteDocument,
    getDocumentAttachments,
    uploadAttachment,
    deleteAttachment
  };
};
