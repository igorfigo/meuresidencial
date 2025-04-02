
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCommonAreas } from '@/hooks/use-common-areas';
import { CommonAreaForm } from '@/components/common-areas/CommonAreaForm';
import { CommonAreasList } from '@/components/common-areas/CommonAreasList';
import { ReservationsCalendar } from '@/components/common-areas/ReservationsCalendar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
import { useApp } from '@/contexts/AppContext';
import { useQueryClient } from '@tanstack/react-query';

const AreasComuns = () => {
  const { user } = useApp();
  const queryClient = useQueryClient();
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

  // Only managers (non-residents and non-admin users) can add/edit areas
  const isManager = user && !user.isAdmin && !user.isResident;
  const isResident = user && user.isResident;

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

  const handleReservationComplete = () => {
    // This function will be called after a successful reservation
    console.log("Reservation completed, refreshing calendar data");
    // Invalidate and refetch reservations data
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Áreas Comuns</h1>
            <p className="text-muted-foreground">
              {isManager 
                ? "Gerencie as áreas comuns do seu condomínio"
                : "Veja e reserve as áreas comuns disponíveis no seu condomínio"
              }
            </p>
          </div>
          {isManager && !showForm && (
            <Button onClick={handleNewArea} className="bg-brand-600 hover:bg-brand-700">
              <Plus className="mr-2 h-4 w-4" />
              Nova Área Comum
            </Button>
          )}
        </div>

        <div className="border-t pt-6">
          {isManager && showForm ? (
            <Card className="border-t-4 border-t-brand-600 shadow-md">
              <CommonAreaForm
                form={form}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                isEditing={!!editingArea}
                onCancel={handleCancelForm}
              />
            </Card>
          ) : (
            <div className="space-y-6">
              {isLoading ? (
                <div className="py-10 text-center text-muted-foreground">
                  Carregando áreas comuns...
                </div>
              ) : (
                <Card className="border-t-4 border-t-brand-600 shadow-md overflow-hidden">
                  <CommonAreasList
                    commonAreas={commonAreas || []}
                    onEdit={isManager ? handleEditArea : undefined}
                    onDelete={isManager ? handleDeleteClick : undefined}
                    isDeleting={isDeleting}
                    fetchReservations={fetchReservations}
                    viewOnly={!isManager}
                    showReservationButton={isResident}
                    onReservationComplete={handleReservationComplete}
                  />
                </Card>
              )}
              
              {/* Show calendar view of all reservations */}
              {commonAreas && commonAreas.length > 0 && (
                <ReservationsCalendar />
              )}
            </div>
          )}
        </div>
      </div>

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
