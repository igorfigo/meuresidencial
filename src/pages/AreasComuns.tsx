
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useCommonAreas } from '@/hooks/use-common-areas';
import { CommonAreaForm } from '@/components/common-areas/CommonAreaForm';
import { CommonAreasList } from '@/components/common-areas/CommonAreasList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

const AreasComuns = () => {
  const { 
    form, 
    commonAreas, 
    isLoading, 
    editingArea, 
    resetForm, 
    onSubmit, 
    deleteCommonArea, 
    isSubmitting, 
    isDeleting,
    fetchReservations,
    refetch
  } = useCommonAreas();
  
  const [showForm, setShowForm] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);

  const handleNewArea = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditArea = (area: any) => {
    resetForm(area);
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
    setAreaToDelete(id);
  };

  const confirmDelete = () => {
    if (areaToDelete) {
      deleteCommonArea(areaToDelete);
      setAreaToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Áreas Comuns</h1>
            <p className="text-muted-foreground">
              Gerencie as áreas comuns do seu condomínio
            </p>
          </div>
          {!showForm && (
            <Button onClick={handleNewArea} className="bg-brand-600 hover:bg-brand-700">
              <Plus className="mr-2 h-4 w-4" />
              Nova Área Comum
            </Button>
          )}
        </div>

        <div className="border-t pt-6">
          {showForm ? (
            <CommonAreaForm
              form={form}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              isEditing={!!editingArea}
              onCancel={handleCancelForm}
            />
          ) : (
            <div className="rounded-md bg-white">
              {isLoading ? (
                <div className="py-10 text-center text-muted-foreground">
                  Carregando áreas comuns...
                </div>
              ) : (
                <CommonAreasList
                  commonAreas={commonAreas || []}
                  onEdit={handleEditArea}
                  onDelete={handleDeleteClick}
                  isDeleting={isDeleting}
                  fetchReservations={fetchReservations}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!areaToDelete} onOpenChange={(open) => !open && setAreaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta área comum? Esta ação não pode ser desfeita.
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

export default AreasComuns;
