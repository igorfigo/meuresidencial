
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { usePestControl } from '@/hooks/use-pest-control';
import { PestControlForm } from '@/components/pest-control/PestControlForm';
import { PestControlsList } from '@/components/pest-control/PestControlsList';
import { Bug } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Dedetizacoes = () => {
  const {
    pestControls,
    isLoading,
    createPestControl,
    updatePestControl,
    deletePestControl,
    filterPestControls,
    searchTerm,
    setSearchTerm,
    filteredPestControls,
    sortOrder,
    setSortOrder,
  } = usePestControl();

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center">
            <Bug className="h-6 w-6 mr-2 text-brand-600" />
            <h1 className="text-3xl font-bold">Dedetizações</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Gerencie os registros de dedetização no condomínio
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PestControlsList
              pestControls={filteredPestControls}
              isLoading={isLoading}
              onDelete={deletePestControl}
              onUpdate={updatePestControl}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          </div>
          <div className="lg:col-span-1">
            <Card className="p-6 border-t-4 border-t-brand-600 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Nova Dedetização</h2>
              <PestControlForm onSubmit={createPestControl} />
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dedetizacoes;
