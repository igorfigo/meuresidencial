
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCommonAreas } from '@/hooks/use-common-areas';
import { CommonAreaForm } from '@/components/common-areas/CommonAreaForm';
import { CommonAreasList } from '@/components/common-areas/CommonAreasList';
import { CommonAreaReservationsList } from '@/components/common-areas/CommonAreaReservationsList';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    refetch,
    approveReservation,
    rejectReservation,
    cancelReservation,
    isProcessingReservation
  } = useCommonAreas();
  
  const [showForm, setShowForm] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [viewReservationsOpen, setViewReservationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('areas');

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

  const handleViewReservations = async (area: any) => {
    setSelectedArea(area);
    const data = await fetchReservations(area.id);
    setReservations(data);
    setViewReservationsOpen(true);
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
          {!showForm && activeTab === 'areas' && (
            <Button onClick={handleNewArea} className="bg-brand-600 hover:bg-brand-700">
              <Plus className="mr-2 h-4 w-4" />
              Nova Área Comum
            </Button>
          )}
        </div>

        <div className="border-t pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="areas">Áreas</TabsTrigger>
              <TabsTrigger value="reservations">Reservas</TabsTrigger>
            </TabsList>

            <TabsContent value="areas">
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
                        onViewReservations={handleViewReservations}
                        isDeleting={isDeleting}
                      />
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reservations">
              <Card className="border-t-4 border-t-brand-600 shadow-md overflow-hidden">
                <CommonAreaReservationsList
                  reservations={reservations}
                  onCancel={cancelReservation}
                  onApprove={approveReservation}
                  onReject={rejectReservation}
                  isCancelling={isDeleting}
                  isProcessing={isProcessingReservation}
                  isResidentView={false}
                />
              </Card>
            </TabsContent>
          </Tabs>
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

      <Dialog open={viewReservationsOpen} onOpenChange={setViewReservationsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reservas: {selectedArea?.name}</DialogTitle>
            <DialogDescription>
              Gerencie as reservas para esta área comum
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <CommonAreaReservationsList
              reservations={reservations}
              onCancel={cancelReservation}
              onApprove={approveReservation}
              onReject={rejectReservation}
              isCancelling={isDeleting}
              isProcessing={isProcessingReservation}
              isResidentView={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AreasComuns;
