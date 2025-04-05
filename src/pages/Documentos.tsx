import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Search, Info } from 'lucide-react';
import { useDocuments } from '@/hooks/use-documents';
import { DocumentForm } from '@/components/documents/DocumentForm';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { Card } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/hooks/use-notifications';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { FinancialChartCard } from '@/components/financials/FinancialChartCard';

const ITEMS_PER_PAGE = 6;

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
    fetchDocuments,
    fetchAttachments
  } = useDocuments();
  
  const [showForm, setShowForm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useApp();
  const { markAsViewed } = useNotifications();
  const isMobile = useIsMobile();
  
  const isResident = user?.isResident === true;

  useEffect(() => {
    if (isResident) {
      markAsViewed('documents');
    }
  }, [isResident, markAsViewed]);

  const filteredDocuments = documents ? documents.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (doc.tipo || "").toLowerCase().includes(searchLower) ||
      (doc.observacoes || "").toLowerCase().includes(searchLower) ||
      (new Date(doc.data_cadastro).toLocaleDateString() || "").toLowerCase().includes(searchLower)
    );
  }) : [];

  const totalPages = filteredDocuments ? Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE) : 1;
  const paginatedDocuments = filteredDocuments ? filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  ) : [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  return (
    <DashboardLayout>
      <div className="space-y-4 px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Documentos Úteis</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {isResident 
                ? "Veja todos os documentos úteis do seu condomínio." 
                : "Gerencie os documentos úteis do seu condomínio"
              }
            </p>
          </div>
          {!showForm && !isResident && (
            <Button 
              onClick={handleNewDocument} 
              className="bg-brand-600 hover:bg-brand-700 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isMobile ? "Novo Documento" : "Novo Documento"}
            </Button>
          )}
        </div>

        <div className="border-t pt-4"></div>

        {!showForm && (
          <div className="mb-2">
            <FinancialChartCard
              title="Pesquisar Documentos"
              icon={<Search className="h-4 w-4" />}
              tooltip="Pesquise por tipo ou observações"
            >
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Pesquisar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              {!isMobile && (
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>{filteredDocuments?.length || 0} {filteredDocuments?.length === 1 ? 'documento encontrado' : 'documentos encontrados'}</span>
                </div>
              )}
            </FinancialChartCard>
          </div>
        )}

        <div className="pt-4 md:pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          ) : showForm && !isResident ? (
            <Card className="border-t-4 border-t-brand-600 shadow-md">
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
            </Card>
          ) : (
            <DocumentsList
              documents={paginatedDocuments}
              onEdit={!isResident ? handleEditDocument : undefined}
              onDelete={!isResident ? handleDeleteClick : undefined}
              isDeleting={isDeleting}
              getFileUrl={getFileUrl}
              fetchAttachments={fetchAttachments}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isResident={isResident}
              searchTerm={searchTerm}
            />
          )}
        </div>
      </div>

      {!isResident && (
        <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
          <AlertDialogContent className="max-w-[90%] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DashboardLayout>
  );
};

export default Documentos;
