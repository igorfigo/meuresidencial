
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountingReport } from '@/components/financials/AccountingReport';
import { useFinances } from '@/hooks/use-finances';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const FinanceiroPrestacaoContas = () => {
  const { isLoading, balance } = useFinances();
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Prestação de Contas</h1>
            <Separator className="mb-2" />
            <p className="text-gray-600 mt-1">Relatório mensal de receitas e despesas do condomínio por data de pagamento</p>
          </div>
          
          <div className="w-64">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-300 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">Saldo Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="text-2xl font-bold text-brand-600">
                      R$ {balance?.balance || '0,00'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <AccountingReport />
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroPrestacaoContas;
