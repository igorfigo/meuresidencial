
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const BusinessExpenses = () => {
  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-brand-600" />
            <h1 className="text-3xl font-bold">Despesas Empresariais</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os contratos da empresa
          </p>
          <Separator className="mt-4" />
        </header>

        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 text-center">
            <p className="text-lg text-muted-foreground">
              Página em desenvolvimento. Em breve você poderá gerenciar as despesas empresariais aqui.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessExpenses;
