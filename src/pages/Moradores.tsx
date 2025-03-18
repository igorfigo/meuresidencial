
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useResidents } from '@/hooks/use-residents';
import { ResidentForm } from '@/components/resident/ResidentForm';
import { ResidentsList } from '@/components/resident/ResidentsList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const Moradores = () => {
  const { 
    form, 
    residents, 
    isLoading, 
    editingResident, 
    resetForm, 
    onSubmit, 
    deleteResident, 
    isSubmitting, 
    isDeleting,
    refetch 
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
          <div className="flex flex-wrap gap-2">
            {!showForm && (
              <Button onClick={handleNewResident} className="bg-brand-600 hover:bg-brand-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Morador
              </Button>
            )}
          </div>
        </div>

        {showForm ? (
          <ResidentForm
            form={form}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            isEditing={!!editingResident}
            onCancel={handleCancelForm}
          />
        ) : (
          <div className="rounded-md bg-white">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">
                Carregando moradores...
              </div>
            ) : (
              <ResidentsList
                residents={residents || []}
                onEdit={handleEditResident}
                onDelete={handleDeleteClick}
                isDeleting={isDeleting}
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!residentToDelete} onOpenChange={(open) => !open && setResidentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este morador? Esta ação não pode ser desfeita.
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
