
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IncomeForm } from '@/components/financials/IncomeForm';
import { RecentTransactions } from '@/components/financials/RecentTransactions';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const FinanceiroReceitas = () => {
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [incomes, setIncomes] = useState<any[]>([]);
  const { user } = useApp();

  useEffect(() => {
    if (user?.selectedCondominium) {
      fetchIncomes();
    }
  }, [user?.selectedCondominium]);

  const fetchIncomes = async () => {
    if (!user?.selectedCondominium) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_incomes')
        .select('*')
        .eq('matricula', user.selectedCondominium)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setIncomes(data || []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      toast.error('Erro ao carregar receitas recentes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIncome = () => {
    setShowIncomeForm(true);
  };

  const handleCancelForm = () => {
    setShowIncomeForm(false);
  };

  const handleIncomeAdded = () => {
    setShowIncomeForm(false);
    fetchIncomes();
    toast.success('Receita adicionada com sucesso!');
  };

  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">Receitas</CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={fetchIncomes}
            variant="outline"
            size="sm"
            className="h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Atualizar
          </Button>
          <Button 
            onClick={handleAddIncome}
            size="sm"
            className="h-8"
            variant="income"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nova Receita
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showIncomeForm ? (
          <IncomeForm onCancel={handleCancelForm} onSuccess={handleIncomeAdded} />
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : incomes.length > 0 ? (
          <RecentTransactions transactions={incomes} type="income" />
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
            <h3 className="text-lg font-medium mb-2">Nenhuma receita registrada</h3>
            <p className="text-gray-500 mb-4">
              Registre suas receitas para ter um controle financeiro completo.
            </p>
            <Button 
              onClick={handleAddIncome}
              variant="income"
            >
              <Plus className="mr-1 h-4 w-4" />
              Nova Receita
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinanceiroReceitas;
