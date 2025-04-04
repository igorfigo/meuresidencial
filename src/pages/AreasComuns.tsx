
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCommonAreas } from '@/hooks/use-common-areas';
import { CommonAreaForm } from '@/components/common-areas/CommonAreaForm';
import { CommonAreasList } from '@/components/common-areas/CommonAreasList';
import { ReservationsCalendar } from '@/components/common-areas/ReservationsCalendar';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MobileAlert } from '@/components/ui/mobile-alert';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { useApp } from '@/contexts/AppContext';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

const AreasComuns = () => {
  const { user } = useApp();
  const isMobile = useIsMobile();
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
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>(isMobile ? 'list' : 'list');

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
    console.log("Reservation completed, refreshing calendar data");
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
  };

  const toggleView = () => {
    setCurrentView(prev => prev === 'list' ? 'calendar' : 'list');
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>Áreas Comuns</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {isManager 
                ? "Gerencie as áreas comuns do seu condomínio"
                : "Veja e reserve as áreas comuns disponíveis no seu condomínio"
              }
            </p>
          </div>
          {isManager && !showForm && (
            <Button onClick={handleNewArea} className="bg-brand-600 hover:bg-brand-700 w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Área Comum
            </Button>
          )}
        </div>

        <div className="border-t pt-4">
          {isManager && showForm ? (
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
              <Card className="border-t-4 border-t-brand-600 shadow-md">
                <CommonAreaForm
                  form={form}
                  onSubmit={handleFormSubmit}
                  isSubmitting={isSubmitting}
                  isEditing={!!editingArea}
                  onCancel={handleCancelForm}
                />
              </Card>
            </>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-10 text-center text-muted-foreground">
                  Carregando áreas comuns...
                </div>
              ) : (
                <>
                  {isMobile && commonAreas && commonAreas.length > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleView}
                        className="text-xs"
                      >
                        {currentView === 'list' ? 'Ver Calendário' : 'Ver Lista'}
                      </Button>
                    </div>
                  )}
                  
                  {(!isMobile || currentView === 'list') && (
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
                  {commonAreas && commonAreas.length > 0 && (!isMobile || currentView === 'calendar') && (
                    <div className={isMobile ? "mt-4" : ""}>
                      <ReservationsCalendar />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <MobileAlert
        isOpen={!!areaToDelete}
        onClose={() => setAreaToDelete(null)}
        title="Confirmação de Exclusão"
        description="Tem certeza que deseja excluir esta área comum? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        destructive={true}
      />
    </DashboardLayout>
  );
};

export default AreasComuns;
