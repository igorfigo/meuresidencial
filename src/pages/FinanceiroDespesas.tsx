
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseForm } from '@/components/financials/ExpenseForm';
import { RecentTransactions } from '@/components/financials/RecentTransactions';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const FinanceiroDespesas = () => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const { user } = useApp();

  useEffect(() => {
    if (user?.selectedCondominium) {
      fetchExpenses();
    }
  }, [user?.selectedCondominium]);

  const fetchExpenses = async () => {
    if (!user?.selectedCondominium) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_expenses')
        .select('*')
        .eq('matricula', user.selectedCondominium)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Erro ao carregar despesas recentes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = () => {
    setShowExpenseForm(true);
  };

  const handleCancelForm = () => {
    setShowExpenseForm(false);
  };

  const handleExpenseAdded = () => {
    setShowExpenseForm(false);
    fetchExpenses();
    toast.success('Despesa adicionada com sucesso!');
  };

  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">Despesas</CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={fetchExpenses}
            variant="outline"
            size="sm"
            className="h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Atualizar
          </Button>
          <Button 
            onClick={handleAddExpense}
            size="sm"
            className="h-8"
            variant="expense"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nova Despesa
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showExpenseForm ? (
          <ExpenseForm onCancel={handleCancelForm} onSuccess={handleExpenseAdded} />
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : expenses.length > 0 ? (
          <RecentTransactions transactions={expenses} type="expense" />
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
            <h3 className="text-lg font-medium mb-2">Nenhuma despesa registrada</h3>
            <p className="text-gray-500 mb-4">
              Registre suas despesas para ter um controle financeiro completo.
            </p>
            <Button 
              onClick={handleAddExpense}
              variant="expense"
            >
              <Plus className="mr-1 h-4 w-4" />
              Nova Despesa
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinanceiroDespesas;
