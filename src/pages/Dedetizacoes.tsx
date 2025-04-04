
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Bug, ChevronLeft } from 'lucide-react';
import { usePestControl } from '@/hooks/use-pest-control';
import { PestControlForm } from '@/components/pest-control/PestControlForm';
import { PestControlsList } from '@/components/pest-control/PestControlsList';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { MobileAlert } from '@/components/ui/mobile-alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Dedetizacoes = () => {
  const isMobile = useIsMobile();
  const { 
    form, 
    pestControls, 
    isLoading, 
    resetForm, 
    onSubmit, 
    deletePestControl,
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
    refetch
  } = usePestControl();
  
  const [showForm, setShowForm] = useState(false);
  const [pestControlToDelete, setPestControlToDelete] = useState<string | null>(null);
  const itemsPerPage = isMobile ? 4 : 6;

  const fetchAttachments = async (pestControlId: string) => {
    const { data } = await supabase
      .from('pest_control_attachments')
      .select('*')
      .eq('pest_control_id', pestControlId);
    
    return data || [];
  };

  const handleNewPestControl = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditPestControl = (pestControl: any) => {
    resetForm(pestControl);
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
    setPestControlToDelete(id);
  };

  const confirmDelete = () => {
    if (pestControlToDelete) {
      deletePestControl(pestControlToDelete);
      setPestControlToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>
              Dedetizações
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Gerencie as dedetizações do seu condomínio
            </p>
          </div>
          <div className="flex w-full md:w-auto">
            {!showForm && (
              <Button 
                onClick={handleNewPestControl} 
                className="bg-brand-600 hover:bg-brand-700 w-full md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Dedetização
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          {showForm ? (
            <>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelForm}
                  className="mb-3 -ml-2 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar para lista
                </Button>
              )}
              
              {isMobile && (
                <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800">
                  <AlertDescription className="text-xs">
                    Preencha todos os campos obrigatórios marcados com * para cadastrar uma nova dedetização.
                  </AlertDescription>
                </Alert>
              )}
              
              <Card className="border-t-4 border-t-brand-600 shadow-md">
                <PestControlForm
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
            </>
          ) : isLoading ? (
            <div className="py-10 text-center text-muted-foreground">
              Carregando dedetizações...
            </div>
          ) : (
            <PestControlsList
              pestControls={pestControls || []}
              onEdit={handleEditPestControl}
              onDelete={handleDeleteClick}
              isDeleting={isDeleting}
              getFileUrl={getFileUrl}
              fetchAttachments={fetchAttachments}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>

      <MobileAlert
        isOpen={!!pestControlToDelete}
        onClose={() => setPestControlToDelete(null)}
        title="Confirmação de Exclusão"
        description="Tem certeza que deseja excluir esta dedetização? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        destructive={true}
      />
    </DashboardLayout>
  );
};

export default Dedetizacoes;
