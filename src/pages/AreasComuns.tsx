
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCommonAreas } from '@/hooks/use-common-areas';
import { useResidentCommonAreas } from '@/hooks/use-resident-common-areas';
import { CommonAreaForm } from '@/components/common-areas/CommonAreaForm';
import { CommonAreasList } from '@/components/common-areas/CommonAreasList';
import { CommonAreaReservationsList } from '@/components/common-areas/CommonAreaReservationsList';
import { ResidentReservationForm } from '@/components/common-areas/ResidentReservationForm';
import { ResidentReservationsList } from '@/components/common-areas/ResidentReservationsList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
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
  const { user } = useApp();
  const isAdmin = user?.isAdmin;
  const isResident = user?.isResident;
  
  // For admin/manager functionality
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
  
  // For resident functionality
  const {
    form: residentForm,
    commonAreas: residentCommonAreas,
    isLoadingAreas,
    myReservations,
    isLoadingReservations,
    showForm,
    isReserving,
    showReservationForm,
    hideReservationForm,
    createReservation,
    cancelReservation,
    fetchReservationsForArea,
  } = useResidentCommonAreas();
  
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(isAdmin ? "manage" : "available");

  useEffect(() => {
    // Set initial tab based on user role
    if (isAdmin) {
      setActiveTab("manage");
    } else if (isResident) {
      setActiveTab("available");
    }
  }, [isAdmin, isResident]);

  // Admin/Manager handlers
  const handleNewArea = () => {
    resetForm();
    setShowAdminForm(true);
  };

  const handleEditArea = (area: any) => {
    resetForm(area);
    setShowAdminForm(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setShowAdminForm(false);
  };

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
    setShowAdminForm(false);
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

  // Render different content based on user role
  const renderContent = () => {
    if (isAdmin) {
      return (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Gerenciar Áreas</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage" className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Gerenciar Áreas Comuns</h2>
                <p className="text-muted-foreground">
                  Cadastre e edite as áreas comuns do condomínio
                </p>
              </div>
              {!showAdminForm && (
                <Button onClick={handleNewArea} className="bg-brand-600 hover:bg-brand-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Área Comum
                </Button>
              )}
            </div>

            {showAdminForm ? (
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
          </TabsContent>
          
          <TabsContent value="reservations" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Reservas de Áreas Comuns</h2>
              <p className="text-muted-foreground">
                Visualize e gerencie as reservas feitas pelos moradores
              </p>
            </div>
            
            <Card className="border-t-4 border-t-brand-600 shadow-md p-6">
              <p className="text-center py-4 text-muted-foreground">
                Funcionalidade de gerenciamento de reservas em desenvolvimento...
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      );
    } else if (isResident) {
      return (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Áreas Disponíveis</TabsTrigger>
            <TabsTrigger value="my-reservations">Minhas Reservas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Áreas Comuns Disponíveis</h2>
              <p className="text-muted-foreground">
                Confira as áreas comuns disponíveis e faça sua reserva
              </p>
            </div>
            
            {showForm ? (
              <Card className="border-t-4 border-t-brand-600 shadow-md">
                <ResidentReservationForm
                  form={residentForm}
                  onSubmit={createReservation}
                  onCancel={hideReservationForm}
                  isSubmitting={isReserving}
                  selectedArea={residentCommonAreas?.find(a => a.id === residentForm.getValues().common_area_id)}
                />
              </Card>
            ) : (
              <CommonAreaReservationsList
                commonAreas={residentCommonAreas || []}
                onReserve={showReservationForm}
                isLoading={isLoadingAreas}
                fetchReservations={fetchReservationsForArea}
              />
            )}
          </TabsContent>
          
          <TabsContent value="my-reservations" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Minhas Reservas</h2>
              <p className="text-muted-foreground">
                Visualize e gerencie suas reservas de áreas comuns
              </p>
            </div>
            
            <ResidentReservationsList
              reservations={myReservations || []}
              isLoading={isLoadingReservations}
              onCancelReservation={cancelReservation}
            />
          </TabsContent>
        </Tabs>
      );
    } else {
      return (
        <div className="py-10 text-center">
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você precisa ser um morador ou administrador para acessar as áreas comuns.
          </p>
        </div>
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Áreas Comuns</h1>
          <p className="text-muted-foreground">
            Gerencie e reserve as áreas comuns do seu condomínio
          </p>
        </div>

        <div className="pt-2">
          {renderContent()}
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
