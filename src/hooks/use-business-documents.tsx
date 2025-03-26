
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BusinessDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  created_by: string;
  has_file: boolean;
  file_name?: string;
  updated_at: string;
}

interface CreateDocumentParams {
  title: string;
  description: string;
  category: string;
}

export const useBusinessDocuments = () => {
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching business documents...');
      
      // Fetch documents from Supabase
      const { data: documentsData, error: documentsError } = await supabase
        .from('business_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (documentsError) {
        console.error('Error fetching business documents:', documentsError);
        throw documentsError;
      }
      
      console.log('Documents data:', documentsData);
      
      // Fetch file information for each document
      const documentsWithFiles = await Promise.all(
        documentsData.map(async (doc) => {
          const { data: fileData, error: fileError } = await supabase
            .from('business_document_attachments')
            .select('file_name')
            .eq('document_id', doc.id)
            .maybeSingle();
          
          if (fileError) {
            console.warn('Error fetching attachment for document:', doc.id, fileError);
          }
          
          return {
            ...doc,
            has_file: !!fileData,
            file_name: fileData?.file_name
          } as BusinessDocument;
        })
      );
      
      setDocuments(documentsWithFiles);
    } catch (err) {
      console.error('Error fetching business documents:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
    
    // Subscribe to real-time changes on the business_documents table
    const documentsSubscription = supabase
      .channel('business_documents_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'business_documents' }, 
        () => {
          console.log('Business documents changed, refreshing...');
          fetchDocuments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(documentsSubscription);
    };
  }, []);
  
  const createDocument = async (document: CreateDocumentParams): Promise<string | null> => {
    try {
      console.log('Creating document:', document);
      
      const { data, error } = await supabase
        .from('business_documents')
        .insert({
          title: document.title,
          description: document.description,
          category: document.category,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating document:', error);
        throw error;
      }
      
      console.log('Created document:', data);
      await fetchDocuments();
      return data.id;
    } catch (err) {
      console.error('Error creating document:', err);
      throw err;
    }
  };
  
  const uploadDocumentFile = async (documentId: string, file: File) => {
    try {
      console.log('Uploading file for document:', documentId, file);
      
      // Step 1: Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentId}-${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business_documents')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        throw uploadError;
      }
      
      console.log('File uploaded successfully to storage');
      
      // Step 2: Create attachment record in database
      const { error: attachmentError } = await supabase
        .from('business_document_attachments')
        .insert({
          document_id: documentId,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        });
        
      if (attachmentError) {
        console.error('Error creating attachment record:', attachmentError);
        throw attachmentError;
      }
      
      console.log('Attachment record created successfully');
      await fetchDocuments();
      toast('Arquivo enviado', {
        description: 'O arquivo foi enviado com sucesso',
      });
    } catch (err) {
      console.error('Error uploading document file:', err);
      toast('Erro ao enviar arquivo', {
        description: 'Não foi possível enviar o arquivo',
        variant: 'destructive',
      });
      throw err;
    }
  };
  
  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      console.log('Downloading document:', documentId, fileName);
      
      // Get file path from attachment record
      const { data: attachment, error: attachmentError } = await supabase
        .from('business_document_attachments')
        .select('file_path')
        .eq('document_id', documentId)
        .maybeSingle();
        
      if (attachmentError) {
        console.error('Error fetching attachment:', attachmentError);
        throw attachmentError;
      }
      
      if (!attachment) {
        console.error('Attachment not found for document:', documentId);
        throw new Error('Attachment not found');
      }
      
      console.log('Found attachment:', attachment);
      
      // Download file from storage
      const { data, error } = await supabase.storage
        .from('business_documents')
        .download(attachment.file_path);
        
      if (error) {
        console.error('Error downloading file from storage:', error);
        throw error;
      }
      
      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast('Download concluído', {
        description: 'O arquivo foi baixado com sucesso',
      });
    } catch (err) {
      console.error('Error downloading document:', err);
      toast('Erro ao baixar arquivo', {
        description: 'Não foi possível baixar o arquivo',
        variant: 'destructive',
      });
      throw err;
    }
  };
  
  const deleteDocument = async (documentId: string) => {
    try {
      console.log('Deleting document:', documentId);
      
      // First, get attachment info
      const { data: attachment, error: attachmentError } = await supabase
        .from('business_document_attachments')
        .select('file_path')
        .eq('document_id', documentId)
        .maybeSingle();
      
      // Delete attachment record and file if exists
      if (attachment) {
        console.log('Found attachment, deleting file from storage:', attachment);
        
        // Delete the file from storage
        const { error: storageError } = await supabase.storage
          .from('business_documents')
          .remove([attachment.file_path]);
          
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          throw storageError;
        }
        
        console.log('File deleted from storage successfully');
      }
      
      // The attachment record will be automatically deleted due to ON DELETE CASCADE
      
      // Finally, delete the document
      const { error: deleteDocError } = await supabase
        .from('business_documents')
        .delete()
        .eq('id', documentId);
        
      if (deleteDocError) {
        console.error('Error deleting document:', deleteDocError);
        throw deleteDocError;
      }
      
      console.log('Document deleted successfully');
      await fetchDocuments();
      
      toast('Documento excluído', {
        description: 'O documento foi excluído com sucesso',
      });
    } catch (err) {
      console.error('Error deleting document:', err);
      toast('Erro ao excluir documento', {
        description: 'Não foi possível excluir o documento',
        variant: 'destructive',
      });
      throw err;
    }
  };
  
  return {
    documents,
    isLoading,
    error,
    createDocument,
    uploadDocumentFile,
    downloadDocument,
    deleteDocument,
    refreshDocuments: fetchDocuments,
  };
};
