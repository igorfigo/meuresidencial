import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { 
  getFinancialIncomes, 
  getFinancialExpenses, 
  getFinancialBalance,
  saveFinancialIncome,
  saveFinancialExpense,
  deleteFinancialIncome,
  deleteFinancialExpense,
  updateFinancialBalance,
  supabase
} from '@/integrations/supabase/client';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import { Transaction } from '@/components/financials/RecentTransactions';

export interface FinancialIncome {
  id?: string;
  matricula: string;
  category: string;
  amount: string;
  reference_month: string;
  payment_date?: string;
  unit?: string;
  observations?: string;
}

export interface FinancialExpense {
  id?: string;
  matricula: string;
  category: string;
  amount: string;
  reference_month: string;
  due_date?: string;
  payment_date?: string;
  unit?: string;
  observations?: string;
}

export interface FinancialBalance {
  id?: string;
  matricula: string;
  balance: string;
}

export const useFinances = () => {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [incomes, setIncomes] = useState<FinancialIncome[]>([]);
  const [expenses, setExpenses] = useState<FinancialExpense[]>([]);
  const [balance, setBalance] = useState<FinancialBalance | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const fetchFinancialData = async () => {
    if (!user?.selectedCondominium) return;
    
    setIsLoading(true);
    try {
      const [incomesData, expensesData, balanceData] = await Promise.all([
        getFinancialIncomes(user.selectedCondominium),
        getFinancialExpenses(user.selectedCondominium),
        getFinancialBalance(user.selectedCondominium)
      ]);
      
      setIncomes(incomesData);
      setExpenses(expensesData);
      setBalance(balanceData);
      
      // Combine and sort recent transactions with proper type
      const allTransactions: Transaction[] = [
        ...incomesData.map(income => ({ 
          ...income, 
          type: 'income' as const,
          date: income.payment_date || new Date().toISOString()
        })),
        ...expensesData.map(expense => ({ 
          ...expense, 
          type: 'expense' as const,
          date: expense.payment_date || expense.due_date || new Date().toISOString()
        }))
      ];
      
      // Sort transactions by created_at date if available, otherwise fall back to date
      const sortedTransactions = allTransactions.sort((a, b) => {
        // First try to sort by created_at if available
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        
        // Fall back to the date field
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setRecentTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.selectedCondominium) {
      fetchFinancialData();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('financial-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'financial_incomes'
        }, () => fetchFinancialData())
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'financial_expenses'
        }, () => fetchFinancialData())
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'financial_balance'
        }, () => fetchFinancialData())
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.selectedCondominium]);

  const addIncome = async (income: FinancialIncome) => {
    try {
      const result = await saveFinancialIncome(income);
      toast.success('Receita adicionada com sucesso');
      await calculateAndUpdateBalance();
      return result; // Return the result for possible use
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Erro ao adicionar receita');
      throw error; // Re-throw to be handled by caller if needed
    }
  };

  const editIncome = async (income: FinancialIncome) => {
    try {
      const result = await saveFinancialIncome(income);
      toast.success('Receita atualizada com sucesso');
      await calculateAndUpdateBalance();
      return result; // Return the result for possible use
    } catch (error) {
      console.error('Error updating income:', error);
      toast.error('Erro ao atualizar receita');
      throw error; // Re-throw to be handled by caller if needed
    }
  };

  const removeIncome = async (id: string) => {
    try {
      await deleteFinancialIncome(id);
      toast.success('Receita removida com sucesso');
      await calculateAndUpdateBalance();
    } catch (error) {
      console.error('Error removing income:', error);
      toast.error('Erro ao remover receita');
    }
  };

  const addExpense = async (expense: FinancialExpense) => {
    try {
      const result = await saveFinancialExpense(expense);
      toast.success('Despesa adicionada com sucesso');
      await calculateAndUpdateBalance();
      return result; // Return the result for possible use
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Erro ao adicionar despesa');
      throw error; // Re-throw to be handled by caller if needed
    }
  };

  const editExpense = async (expense: FinancialExpense) => {
    try {
      const result = await saveFinancialExpense(expense);
      toast.success('Despesa atualizada com sucesso');
      await calculateAndUpdateBalance();
      return result; // Return the result for possible use
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Erro ao atualizar despesa');
      throw error; // Re-throw to be handled by caller if needed
    }
  };

  const removeExpense = async (id: string) => {
    try {
      await deleteFinancialExpense(id);
      toast.success('Despesa removida com sucesso');
      await calculateAndUpdateBalance();
    } catch (error) {
      console.error('Error removing expense:', error);
      toast.error('Erro ao remover despesa');
    }
  };

  const calculateAndUpdateBalance = async () => {
    if (!user?.selectedCondominium) return;
    
    try {
      const freshIncomes = await getFinancialIncomes(user.selectedCondominium);
      const freshExpenses = await getFinancialExpenses(user.selectedCondominium);
      
      const totalIncome = freshIncomes.reduce((sum, income) => {
        return sum + BRLToNumber(income.amount);
      }, 0);
      
      const totalExpense = freshExpenses.reduce((sum, expense) => {
        return sum + BRLToNumber(expense.amount);
      }, 0);
      
      const newBalance = totalIncome - totalExpense;
      
      const formattedBalance = formatToBRL(newBalance);
      
      await updateFinancialBalance(user.selectedCondominium, formattedBalance);
      
      const updatedBalance = await getFinancialBalance(user.selectedCondominium);
      setBalance(updatedBalance);
      
      await fetchFinancialData();
    } catch (error) {
      console.error('Error calculating and updating balance:', error);
      toast.error('Erro ao atualizar saldo');
    }
  };

  const updateBalance = async (manualBalance?: string) => {
    if (!user?.selectedCondominium) return;
    
    try {
      if (manualBalance) {
        await updateFinancialBalance(user.selectedCondominium, manualBalance);
        
        const updatedBalance = await getFinancialBalance(user.selectedCondominium);
        setBalance(updatedBalance);
      } else {
        await calculateAndUpdateBalance();
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Erro ao atualizar saldo');
    }
  };

  return {
    isLoading,
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
    refreshData: fetchFinancialData
  };
};
