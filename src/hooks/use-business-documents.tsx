
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessDocument {
  id: string;
  tipo: string;
  data_cadastro: string;
  observacoes: string | null;
  matricula: string;
  created_at: string;
  updated_at: string;
  attachments?: BusinessDocumentAttachment[];
}

export interface BusinessDocumentAttachment {
  id: string;
  document_id: string;
  file_name: string;
  file_type: string;
  file_path: string;
  created_at: string;
}

export interface BusinessDocumentFormData {
  tipo: string;
  data_cadastro: string;
  observacoes: string | null;
  files: File[];
}

export function useBusinessDocuments() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['business-documents'],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from('business_documents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as BusinessDocument[];
      } catch (error) {
        console.error('Error fetching business documents:', error);
        toast.error('Erro ao carregar documentos');
        return [];
      }
    },
    enabled: !!user,
  });

  const getDocumentAttachments = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_document_attachments')
        .select('*')
        .eq('document_id', documentId);

      if (error) throw error;
      return data as BusinessDocumentAttachment[];
    } catch (error) {
      console.error('Error fetching document attachments:', error);
      toast.error('Erro ao carregar anexos');
      return [];
    }
  };

  const createDocumentMutation = useMutation({
    mutationFn: async (formData: BusinessDocumentFormData) => {
      if (!user?.matricula) {
        throw new Error('User not authenticated');
      }

      setIsUploading(true);
      try {
        // Insert document record
        const { data: documentData, error: documentError } = await supabase
          .from('business_documents')
          .insert({
            tipo: formData.tipo,
            data_cadastro: formData.data_cadastro,
            observacoes: formData.observacoes,
            matricula: user.matricula,
          })
          .select()
          .single();

        if (documentError) throw documentError;

        // Upload files if any
        if (formData.files && formData.files.length > 0) {
          const documentId = documentData.id;
          const attachments: BusinessDocumentAttachment[] = [];

          for (const file of formData.files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${documentId}/${fileName}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
              .from('business_documents')
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from('business_documents')
              .getPublicUrl(filePath);

            // Create attachment record
            const { data: attachmentData, error: attachmentError } = await supabase
              .from('business_document_attachments')
              .insert({
                document_id: documentId,
                file_name: file.name,
                file_type: file.type,
                file_path: publicUrlData.publicUrl,
              })
              .select()
              .single();

            if (attachmentError) throw attachmentError;
            attachments.push(attachmentData);
          }

          return { ...documentData, attachments };
        }

        return documentData;
      } catch (error) {
        console.error('Error creating document:', error);
        toast.error('Erro ao salvar documento');
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-documents'] });
      toast.success('Documento salvo com sucesso');
    },
    onError: () => {
      toast.error('Erro ao salvar documento');
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      try {
        // Get attachments first
        const attachments = await getDocumentAttachments(documentId);
        
        // Delete attachments from storage
        for (const attachment of attachments) {
          const path = attachment.file_path.split('/').slice(-2).join('/');
          await supabase.storage.from('business_documents').remove([path]);
        }
        
        // Delete document (cascade will handle attachments)
        const { error } = await supabase
          .from('business_documents')
          .delete()
          .eq('id', documentId);

        if (error) throw error;
        return documentId;
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Erro ao excluir documento');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-documents'] });
      toast.success('Documento excluído com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir documento');
    },
  });

  return {
    documents,
    isLoading,
    error,
    isUploading,
    getDocumentAttachments,
    createDocument: createDocumentMutation.mutate,
    deleteDocument: deleteDocumentMutation.mutate,
  };
}
