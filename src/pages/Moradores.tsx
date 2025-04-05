
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useResidents } from '@/hooks/use-residents';
import { ResidentForm } from '@/components/resident/ResidentForm';
import { ResidentsList } from '@/components/resident/ResidentsList';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FinancialChartCard } from '@/components/financials/FinancialChartCard';
import { Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  // Filter residents based on search term
  const filteredResidents = residents?.filter(resident => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (resident.nome_completo || "").toLowerCase().includes(searchLower) ||
      (resident.unidade || "").toLowerCase().includes(searchLower) ||
      (resident.cpf || "").toLowerCase().includes(searchLower) ||
      (resident.email || "").toLowerCase().includes(searchLower) ||
      (resident.telefone || "").toLowerCase().includes(searchLower)
    );
  });

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

        {/* Search Bar */}
        {!showForm && (
          <div className="mb-4">
            <FinancialChartCard
              title="Pesquisar Moradores"
              icon={<Search className="h-4 w-4" />}
              tooltip="Pesquise por nome, unidade, CPF, email ou telefone"
            >
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Pesquisar moradores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              {!isMobile && (
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>{filteredResidents?.length || 0} {filteredResidents?.length === 1 ? 'morador encontrado' : 'moradores encontrados'}</span>
                </div>
              )}
            </FinancialChartCard>
          </div>
        )}

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
                  residents={filteredResidents || []}
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
