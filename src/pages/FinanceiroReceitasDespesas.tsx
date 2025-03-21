import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IncomeForm } from '@/components/financials/IncomeForm';
import { ExpenseForm } from '@/components/financials/ExpenseForm';
import { BalanceDisplay } from '@/components/financials/BalanceDisplay';
import { RecentTransactions } from '@/components/financials/RecentTransactions';
import { useFinances, FinancialIncome, FinancialExpense } from '@/hooks/use-finances';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

const FinanceiroReceitasDespesas = () => {
  const { user } = useApp();
  const { 
    incomes, 
    expenses, 
    balance, 
    recentTransactions,
    addIncome,
    editIncome,
    removeIncome,
    addExpense,
    editExpense,
    removeExpense,
    updateBalance,
    isLoading,
    refreshData,
    calculateAndUpdateBalance
  } = useFinances();
  
  const [activeTab, setActiveTab] = useState<string>('income');
  
  const handleIncomeSubmit = async (data: FinancialIncome) => {
    try {
      if (data.id) {
        await editIncome(data);
      } else {
        await addIncome(data);
      }
    } catch (error) {
      console.error('Error submitting income:', error);
      toast.error('Erro ao salvar receita');
    }
  };
  
  const handleExpenseSubmit = async (data: FinancialExpense, attachments?: File[]) => {
    try {
      if (data.id) {
        await editExpense(data);
      } else {
        const result = await addExpense(data);
        
        if (attachments && attachments.length > 0 && result && result.length > 0) {
          const expenseId = result[0]?.id;
          
          if (expenseId) {
            for (const file of attachments) {
              const filename = `${Date.now()}-${file.name}`;
              const filePath = `expense-attachments/${user?.selectedCondominium}/${expenseId}/${filename}`;
              
              const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file);
              
              if (uploadError) {
                console.error('Error uploading file:', uploadError);
                toast.error(`Erro ao anexar arquivo: ${file.name}`);
                continue;
              }
              
              const { data: publicUrlData } = supabase.storage
                .from('attachments')
                .getPublicUrl(filePath);
              
              await supabase.from('expense_attachments').insert({
                expense_id: expenseId,
                file_name: file.name,
                file_path: filePath,
                file_type: file.type
              });
            }
            
            toast.success('Comprovantes anexados com sucesso');
          }
        }
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error('Erro ao salvar despesa');
    }
  };
  
  const handleUpdateBalance = async (newBalance: string) => {
    try {
      const oldBalance = balance?.balance || '0,00';
      
      const tempBalance = {...balance, balance: newBalance};
      
      const [balanceAdjustmentResult] = await Promise.all([
        user?.selectedCondominium ? 
          supabase.from('balance_adjustments').insert({
            matricula: user.selectedCondominium,
            previous_balance: oldBalance,
            new_balance: newBalance,
            adjustment_date: new Date().toISOString()
          }) : Promise.resolve(null),
        
        updateBalance(newBalance)
      ]);
      
      if (balanceAdjustmentResult?.error) {
        throw balanceAdjustmentResult.error;
      }
      
      await refreshData();
      
      toast.success('Saldo atualizado com sucesso');
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Erro ao atualizar saldo');
      await refreshData();
    }
  };
  
  const calculateFinancialSummary = () => {
    const totalIncome = incomes.reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);
    const currentBalance = balance?.balance ? BRLToNumber(balance.balance) : (totalIncome - totalExpense);
    
    return {
      totalIncome: formatToBRL(totalIncome),
      totalExpense: formatToBRL(totalExpense),
      currentBalance: formatToBRL(currentBalance)
    };
  };
  
  const { currentBalance } = calculateFinancialSummary();

  const handleDeleteIncome = async (id: string) => {
    try {
      const incomeToDelete = incomes.find(income => income.id === id);
      
      if (!incomeToDelete) {
        throw new Error('Receita não encontrada');
      }
      
      const currentBalanceValue = balance?.balance ? BRLToNumber(balance.balance) : 0;
      const incomeAmount = BRLToNumber(incomeToDelete.amount);
      
      const newBalanceValue = currentBalanceValue - incomeAmount;
      const newBalanceFormatted = formatToBRL(newBalanceValue);
      
      if (balance) {
        updateBalance(newBalanceFormatted);
      }
      
      await removeIncome(id);
      
      await calculateAndUpdateBalance();
      
      toast.success('Receita excluída com sucesso');
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Erro ao excluir receita');
      await refreshData();
    }
  };
  
  const handleDeleteExpense = async (id: string) => {
    try {
      const expenseToDelete = expenses.find(expense => expense.id === id);
      
      if (!expenseToDelete) {
        throw new Error('Despesa não encontrada');
      }
      
      const currentBalanceValue = balance?.balance ? BRLToNumber(balance.balance) : 0;
      const expenseAmount = BRLToNumber(expenseToDelete.amount);
      
      const newBalanceValue = currentBalanceValue + expenseAmount;
      const newBalanceFormatted = formatToBRL(newBalanceValue);
      
      if (balance) {
        updateBalance(newBalanceFormatted);
      }
      
      await removeExpense(id);
      
      await calculateAndUpdateBalance();
      
      toast.success('Despesa excluída com sucesso');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Erro ao excluir despesa');
      await refreshData();
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Receitas/Despesas</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-lg text-gray-500">Carregando dados financeiros...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Receitas/Despesas</h1>
            <p className="text-gray-500 mt-1">Gestão de receitas e despesas do condomínio</p>
          </div>
          <div className="w-64">
            <BalanceDisplay 
              balance={balance?.balance || currentBalance} 
              onBalanceChange={handleUpdateBalance}
              matricula={user?.selectedCondominium}
            />
          </div>
        </div>
        
        <Tabs defaultValue="income" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="income" className="mt-6">
            <IncomeForm onSubmit={handleIncomeSubmit} />
          </TabsContent>
          
          <TabsContent value="expense" className="mt-6">
            <ExpenseForm onSubmit={handleExpenseSubmit} />
          </TabsContent>
        </Tabs>
        
        <div className="mb-8">
          <RecentTransactions 
            transactions={recentTransactions} 
            onDeleteIncome={handleDeleteIncome}
            onDeleteExpense={handleDeleteExpense}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroReceitasDespesas;
