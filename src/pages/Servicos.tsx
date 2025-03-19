
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ServiceProviderSearch } from '@/components/services/ServiceProviderSearch';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const Servicos = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Serviços Gerais</h1>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Busca de Prestadores de Serviço</CardTitle>
          </CardHeader>
          <ServiceProviderSearch />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Servicos;
