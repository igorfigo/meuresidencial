
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useResidents } from '@/hooks/use-residents';
import { ResidentForm } from '@/components/resident/ResidentForm';
import { ResidentsList } from '@/components/resident/ResidentsList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Moradores = () => {
  const { 
    form, 
    residents, 
    isLoading, 
    editingResident, 
    resetForm, 
    onSubmit, 
    deleteResident, 
    toggleResidentActive,
    isSubmitting, 
    isDeleting,
    isTogglingActive,
    refetch,
    planLimitError
  } = useResidents();
  
  const [showForm, setShowForm] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<string | null>(null);

  const handleNewResident = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditResident = (resident: any) => {
    resetForm(resident);
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
    setResidentToDelete(id);
  };

  const confirmDelete = () => {
    if (residentToDelete) {
      deleteResident(residentToDelete);
      setResidentToDelete(null);
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    toggleResidentActive(id, active);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Moradores</h1>
            <p className="text-muted-foreground">
              Gerencie os moradores do seu condomínio
            </p>
          </div>
          {!showForm && !planLimitError && (
            <Button onClick={handleNewResident} className="bg-brand-600 hover:bg-brand-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Morador
            </Button>
          )}
        </div>

        {planLimitError && !editingResident && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {planLimitError}
            </AlertDescription>
          </Alert>
        )}

        <div className="border-t pt-6">
          {showForm ? (
            <ResidentForm
              form={form}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              isEditing={!!editingResident}
              onCancel={handleCancelForm}
            />
          ) : (
            <div>
              {isLoading ? (
                <div className="py-10 text-center text-muted-foreground">
                  Carregando moradores...
                </div>
              ) : (
                <ResidentsList
                  residents={residents || []}
                  onEdit={handleEditResident}
                  onDelete={handleDeleteClick}
                  onToggleActive={handleToggleActive}
                  isDeleting={isDeleting}
                  isTogglingActive={isTogglingActive}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!residentToDelete} onOpenChange={(open) => !open && setResidentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Atenção: Ao excluir este morador, ele não terá mais acesso a todo o histórico de sua conta. Somente o síndico terá acesso a estas informações.
              <br /><br />
              Esta ação não pode ser desfeita.
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

export default Moradores;
