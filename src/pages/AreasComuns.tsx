
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCommonAreas } from '@/hooks/use-common-areas';
import { useResidentCommonAreas } from '@/hooks/use-resident-common-areas';
import { CommonAreaForm } from '@/components/common-areas/CommonAreaForm';
import { CommonAreasList } from '@/components/common-areas/CommonAreasList';
import { ResidentCommonAreasList } from '@/components/resident/CommonAreasList';
import { ReservationForm } from '@/components/resident/ReservationForm';
import { MyReservationsList } from '@/components/resident/MyReservationsList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const AreasComuns = () => {
  const { isAdmin, isResident } = useApp();
  const [currentTab, setCurrentTab] = useState<string>(isAdmin ? "manage" : "reserve");
  
  // Admin hook for managing common areas
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
  
  // Resident hook for reserving common areas
  const {
    form: reservationForm,
    commonAreas: residentCommonAreas,
    myReservations,
    isLoadingAreas,
    isLoadingReservations,
    isSubmitting: isSubmittingReservation,
    isDeleting: isDeletingReservation,
    onSubmit: onSubmitReservation,
    onCancelReservation,
    resetForm: resetReservationForm,
    selectedCommonArea,
    selectCommonArea
  } = useResidentCommonAreas();
  
  const [showForm, setShowForm] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);

  // Admin handlers
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

  // Resident handlers
  const handleSelectArea = (area: any) => {
    selectCommonArea(area);
    setShowReservationForm(true);
  };

  const handleCancelReservationForm = () => {
    resetReservationForm();
    setShowReservationForm(false);
  };

  const handleReservationSubmit = (data: any) => {
    onSubmitReservation(data);
    setShowReservationForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Áreas Comuns</h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Gerencie as áreas comuns do seu condomínio" 
                : "Visualize e reserve áreas comuns do seu condomínio"}
            </p>
          </div>
          {isAdmin && !showForm && (
            <Button onClick={handleNewArea} className="bg-brand-600 hover:bg-brand-700">
              <Plus className="mr-2 h-4 w-4" />
              Nova Área Comum
            </Button>
          )}
        </div>

        <div className="border-t pt-6">
          {isAdmin ? (
            // Admin View
            <>
              {showForm ? (
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
                <div>
                  {isLoading ? (
                    <div className="py-10 text-center text-muted-foreground">
                      Carregando áreas comuns...
                    </div>
                  ) : (
                    <Card className="border-t-4 border-t-brand-600 shadow-md overflow-hidden">
                      <CommonAreasList
                        commonAreas={commonAreas || []}
                        onEdit={handleEditArea}
                        onDelete={handleDeleteClick}
                        isDeleting={isDeleting}
                        fetchReservations={fetchReservations}
                      />
                    </Card>
                  )}
                </div>
              )}
            </>
          ) : (
            // Resident View
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reserve">Reservar</TabsTrigger>
                <TabsTrigger value="my-reservations">Minhas Reservas</TabsTrigger>
              </TabsList>
              <TabsContent value="reserve" className="pt-4">
                {showReservationForm ? (
                  <ReservationForm
                    form={reservationForm}
                    onSubmit={handleReservationSubmit}
                    onCancel={handleCancelReservationForm}
                    isSubmitting={isSubmittingReservation}
                    selectedArea={selectedCommonArea}
                  />
                ) : (
                  <ResidentCommonAreasList
                    commonAreas={residentCommonAreas || []}
                    isLoading={isLoadingAreas}
                    onSelect={handleSelectArea}
                  />
                )}
              </TabsContent>
              <TabsContent value="my-reservations" className="pt-4">
                <MyReservationsList
                  reservations={myReservations || []}
                  isLoading={isLoadingReservations}
                  onCancel={onCancelReservation}
                  isDeleting={isDeletingReservation}
                />
              </TabsContent>
            </Tabs>
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
