
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDocuments } from '@/hooks/use-documents';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentForm } from '@/components/documents/DocumentForm';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Documentos = () => {
  const {
    form,
    documents,
    isLoading,
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
    resetForm,
    fetchAttachments
  } = useDocuments();
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  
  const handleEdit = (document: any) => {
    resetForm(document);
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-brand-600" />
            <h1 className="text-3xl font-bold">Documentos Úteis</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Gerencie documentos importantes do condomínio
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DocumentsList
              documents={documents}
              onEdit={handleEdit}
              onDelete={deleteDocument}
              isDeleting={isDeleting}
              getFileUrl={getFileUrl}
              fetchAttachments={fetchAttachments}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
          <div className="lg:col-span-1">
            <Card className="p-6 border-t-4 border-t-brand-600 shadow-md">
              <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Editar Documento' : 'Novo Documento Útil'}</h2>
              <DocumentForm 
                form={form}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
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
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentos;
