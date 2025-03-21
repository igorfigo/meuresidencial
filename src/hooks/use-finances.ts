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
  is_manual?: boolean;
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
      
      const sortedTransactions = allTransactions.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        
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
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'balance_adjustments'
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
      return result;
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Erro ao adicionar receita');
      throw error;
    }
  };

  const editIncome = async (income: FinancialIncome) => {
    try {
      const result = await saveFinancialIncome(income);
      toast.success('Receita atualizada com sucesso');
      await calculateAndUpdateBalance();
      return result;
    } catch (error) {
      console.error('Error updating income:', error);
      toast.error('Erro ao atualizar receita');
      throw error;
    }
  };

  const removeIncome = async (id: string) => {
    try {
      await deleteFinancialIncome(id);
      toast.success('Receita removida com sucesso');
      await calculateAndUpdateBalance();
      return true;
    } catch (error) {
      console.error('Error removing income:', error);
      toast.error('Erro ao remover receita');
      throw error;
    }
  };

  const addExpense = async (expense: FinancialExpense) => {
    try {
      const result = await saveFinancialExpense(expense);
      toast.success('Despesa adicionada com sucesso');
      await calculateAndUpdateBalance();
      return result;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Erro ao adicionar despesa');
      throw error;
    }
  };

  const editExpense = async (expense: FinancialExpense) => {
    try {
      const result = await saveFinancialExpense(expense);
      toast.success('Despesa atualizada com sucesso');
      await calculateAndUpdateBalance();
      return result;
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Erro ao atualizar despesa');
      throw error;
    }
  };

  const removeExpense = async (id: string) => {
    try {
      await deleteFinancialExpense(id);
      toast.success('Despesa removida com sucesso');
      await calculateAndUpdateBalance();
      return true;
    } catch (error) {
      console.error('Error removing expense:', error);
      toast.error('Erro ao remover despesa');
      throw error;
    }
  };

  const calculateAndUpdateBalance = async () => {
    if (!user?.selectedCondominium) return;
    
    try {
      const currentBalanceData = await getFinancialBalance(user.selectedCondominium);
      
      const freshIncomes = await getFinancialIncomes(user.selectedCondominium);
      const freshExpenses = await getFinancialExpenses(user.selectedCondominium);
      
      const totalIncome = freshIncomes.reduce((sum, income) => {
        return sum + BRLToNumber(income.amount);
      }, 0);
      
      const totalExpense = freshExpenses.reduce((sum, expense) => {
        return sum + BRLToNumber(expense.amount);
      }, 0);
      
      let newBalance;
      
      if (currentBalanceData?.is_manual) {
        const currentBalanceValue = BRLToNumber(currentBalanceData.balance);
        
        const latestTransactions = [...freshIncomes, ...freshExpenses].sort((a, b) => {
          const aDate = new Date(a.created_at || new Date());
          const bDate = new Date(b.created_at || new Date());
          return bDate.getTime() - aDate.getTime();
        });
        
        if (latestTransactions.length > 0) {
          const latestTransaction = latestTransactions[0];
          const transactionAmount = BRLToNumber(latestTransaction.amount);
          
          const isIncome = freshIncomes.some(income => income.id === latestTransaction.id);
          
          newBalance = isIncome 
            ? currentBalanceValue + transactionAmount 
            : currentBalanceValue - transactionAmount;
        } else {
          newBalance = currentBalanceValue;
        }
      } else {
        newBalance = totalIncome - totalExpense;
      }
      
      const formattedBalance = formatToBRL(newBalance);
      
      await updateFinancialBalance(
        user.selectedCondominium, 
        formattedBalance, 
        currentBalanceData?.is_manual || false
      );
      
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
        await updateFinancialBalance(
          user.selectedCondominium, 
          manualBalance, 
          true
        );
        
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
