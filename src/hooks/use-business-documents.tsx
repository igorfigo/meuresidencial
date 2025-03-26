
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
      
      // Fetch documents from Supabase
      const { data: documentsData, error: documentsError } = await supabase
        .from('business_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (documentsError) throw documentsError;
      
      // Fetch file information for each document
      const documentsWithFiles = await Promise.all(
        documentsData.map(async (doc) => {
          const { data: fileData, error: fileError } = await supabase
            .from('business_document_attachments')
            .select('file_name')
            .eq('document_id', doc.id)
            .maybeSingle();
          
          return {
            ...doc,
            has_file: !!fileData,
            file_name: fileData?.file_name
          };
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
      const { data, error } = await supabase
        .from('business_documents')
        .insert({
          title: document.title,
          description: document.description,
          category: document.category,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      await fetchDocuments();
      return data.id;
    } catch (err) {
      console.error('Error creating document:', err);
      throw err;
    }
  };
  
  const uploadDocumentFile = async (documentId: string, file: File) => {
    try {
      // Step 1: Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentId}-${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business_documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
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
        
      if (attachmentError) throw attachmentError;
      
      await fetchDocuments();
    } catch (err) {
      console.error('Error uploading document file:', err);
      throw err;
    }
  };
  
  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      // Get file path from attachment record
      const { data: attachment, error: attachmentError } = await supabase
        .from('business_document_attachments')
        .select('file_path')
        .eq('document_id', documentId)
        .maybeSingle();
        
      if (attachmentError) throw attachmentError;
      if (!attachment) throw new Error('Attachment not found');
      
      // Download file from storage
      const { data, error } = await supabase.storage
        .from('business_documents')
        .download(attachment.file_path);
        
      if (error) throw error;
      
      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading document:', err);
      throw err;
    }
  };
  
  const deleteDocument = async (documentId: string) => {
    try {
      // First, get attachment info
      const { data: attachment, error: attachmentError } = await supabase
        .from('business_document_attachments')
        .select('file_path')
        .eq('document_id', documentId)
        .maybeSingle();
      
      // Delete attachment record if exists
      if (attachment) {
        // Delete the file from storage
        const { error: storageError } = await supabase.storage
          .from('business_documents')
          .remove([attachment.file_path]);
          
        if (storageError) throw storageError;
        
        // Delete attachment record
        const { error: deleteAttachmentError } = await supabase
          .from('business_document_attachments')
          .delete()
          .eq('document_id', documentId);
          
        if (deleteAttachmentError) throw deleteAttachmentError;
      }
      
      // Finally, delete the document
      const { error: deleteDocError } = await supabase
        .from('business_documents')
        .delete()
        .eq('id', documentId);
        
      if (deleteDocError) throw deleteDocError;
      
      await fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
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
