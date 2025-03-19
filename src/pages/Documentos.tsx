
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { useDocuments } from '@/hooks/use-documents';
import { DocumentForm } from '@/components/documents/DocumentForm';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

const Documentos = () => {
  const { 
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
    fetchAttachments
  } = useDocuments();
  
  const [showForm, setShowForm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDocuments, setFilteredDocuments] = useState(documents);
  
  const ITEMS_PER_PAGE = 5; // Changed from 10 to 5
  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setFilteredDocuments(documents.slice(startIndex, endIndex));
  }, [documents, currentPage]);

  const handleNewDocument = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditDocument = (document: any) => {
    resetForm(document);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
    setShowForm(false);
  };

  const handleDeleteClick = (id: string) => {
    setDocumentToDelete(id);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteDocument(documentToDelete);
      setDocumentToDelete(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documentos Úteis</h1>
            <p className="text-muted-foreground">
              Gerencie os documentos importantes do seu condomínio
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!showForm && (
              <Button onClick={handleNewDocument} className="bg-brand-600 hover:bg-brand-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Documento
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          {showForm ? (
            <DocumentForm
              form={form}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              isEditing={!!form.getValues().id}
              onCancel={handleCancelForm}
              attachments={attachments}
              existingAttachments={existingAttachments}
              handleFileChange={handleFileChange}
              removeFile={removeFile}
              removeExistingAttachment={removeExistingAttachment}
              getFileUrl={getFileUrl}
              uploadProgress={uploadProgress}
              isUploading={isUploading}
            />
          ) : (
            <div className="rounded-md bg-white">
              {isLoading ? (
                <div className="py-10 text-center text-muted-foreground">
                  Carregando documentos...
                </div>
              ) : (
                <DocumentsList
                  documents={filteredDocuments}
                  onEdit={handleEditDocument}
                  onDelete={handleDeleteClick}
                  isDeleting={isDeleting}
                  getFileUrl={getFileUrl}
                  fetchAttachments={fetchAttachments}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Documentos;
