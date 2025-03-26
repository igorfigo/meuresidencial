
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BusinessDocumentsList } from '@/components/business-documents/BusinessDocumentsList';
import { BusinessDocumentForm } from '@/components/business-documents/BusinessDocumentForm';
import { useForm } from 'react-hook-form';
import { BusinessDocument, BusinessDocumentFormValues, BusinessDocumentAttachment, useBusinessDocuments } from '@/hooks/use-business-documents';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const BusinessDocumentos = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<BusinessDocument | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<BusinessDocumentAttachment[]>([]);
  
  const { 
    createDocument, 
    updateDocument, 
    fetchDocumentAttachments,
    deleteAttachment,
    getFileUrl,
    isUploading,
    uploadProgress
  } = useBusinessDocuments();

  const form = useForm<BusinessDocumentFormValues>({
    defaultValues: {
      tipo: '',
      data_cadastro: format(new Date(), 'yyyy-MM-dd'),
      observacoes: '',
    },
  });

  useEffect(() => {
    if (isCreating) {
      form.reset({
        tipo: '',
        data_cadastro: format(new Date(), 'yyyy-MM-dd'),
        observacoes: '',
      });
      setAttachments([]);
      setExistingAttachments([]);
    }
  }, [isCreating, form]);

  useEffect(() => {
    const loadDocumentData = async () => {
      if (selectedDocument && isEditing) {
        form.reset({
          tipo: selectedDocument.tipo,
          data_cadastro: selectedDocument.data_cadastro.split('T')[0],
          observacoes: selectedDocument.observacoes || '',
        });
        
        try {
          const attachments = await fetchDocumentAttachments(selectedDocument.id);
          setExistingAttachments(attachments);
        } catch (error) {
          console.error('Error fetching attachments:', error);
        }
      }
    };

    loadDocumentData();
  }, [selectedDocument, isEditing, form, fetchDocumentAttachments]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = async (id: string) => {
    const attachment = existingAttachments.find(a => a.id === id);
    if (attachment) {
      await deleteAttachment.mutateAsync(attachment);
      setExistingAttachments(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedDocument(null);
  };

  const handleEdit = (document: BusinessDocument) => {
    setSelectedDocument(document);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedDocument(null);
    setAttachments([]);
  };

  const onSubmit = async (data: BusinessDocumentFormValues) => {
    try {
      if (attachments.length === 0 && existingAttachments.length === 0) {
        toast({
          title: "Erro ao salvar documento",
          description: "É necessário anexar pelo menos um arquivo.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Submitting document:", { data, attachments, isEditing, selectedDocument });
      
      if (isEditing && selectedDocument) {
        await updateDocument.mutateAsync({
          id: selectedDocument.id,
          values: data,
          attachments,
        });
        
        toast({
          title: "Documento atualizado",
          description: "O documento foi atualizado com sucesso.",
        });
      } else {
        console.log("Creating new document with:", { values: data, attachments });
        await createDocument.mutateAsync({
          values: data,
          attachments,
        });
        
        toast({
          title: "Documento salvo",
          description: "O documento foi salvo com sucesso.",
        });
      }
      
      setIsCreating(false);
      setIsEditing(false);
      setSelectedDocument(null);
      setAttachments([]);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o documento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {isCreating ? 'Novo Documento' : isEditing ? 'Editar Documento' : 'Documentos'}
        </h1>

        {!isCreating && !isEditing ? (
          <BusinessDocumentsList 
            onCreateNew={handleCreateNew} 
            onEdit={handleEdit} 
          />
        ) : (
          <BusinessDocumentForm
            form={form}
            onSubmit={onSubmit}
            isSubmitting={createDocument.isPending || updateDocument.isPending}
            isEditing={isEditing}
            onCancel={handleCancel}
            attachments={attachments}
            existingAttachments={existingAttachments}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
            removeExistingAttachment={removeExistingAttachment}
            getFileUrl={getFileUrl}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default BusinessDocumentos;
