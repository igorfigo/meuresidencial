
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useBusinessExpenses } from '@/hooks/use-business-expenses';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BusinessExpenseForm from '@/components/business/BusinessExpenseForm';
import BusinessExpensesList from '@/components/business/BusinessExpensesList';

const DespesasEmpresariais = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { isLoading, error } = useBusinessExpenses();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Despesas Empresariais</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Despesa
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">Erro ao carregar despesas: {error.message}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Despesas</CardTitle>
            <CardDescription>
              Gerencie todas as despesas empresariais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessExpensesList />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Despesa Empresarial</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova despesa empresarial.
            </DialogDescription>
          </DialogHeader>
          <BusinessExpenseForm 
            onSuccess={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DespesasEmpresariais;
