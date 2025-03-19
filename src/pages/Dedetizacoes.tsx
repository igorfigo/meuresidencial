
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Bug } from 'lucide-react';
import { usePestControl } from '@/hooks/use-pest-control';
import { PestControlForm } from '@/components/pest-control/PestControlForm';
import { PestControlsList } from '@/components/pest-control/PestControlsList';
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

const Dedetizacoes = () => {
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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dedetizações</h1>
            <p className="text-muted-foreground">
              Gerencie as dedetizações do seu condomínio
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!showForm && (
              <Button onClick={handleNewPestControl} className="bg-brand-600 hover:bg-brand-700">
                <Plus className="mr-2 h-4 w-4" />
                Nova Dedetização
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          {showForm ? (
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
          ) : (
            <div className="rounded-md bg-white">
              {isLoading ? (
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
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pestControlToDelete} onOpenChange={(open) => !open && setPestControlToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta dedetização? Esta ação não pode ser desfeita.
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

export default Dedetizacoes;
