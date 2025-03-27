
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';

export interface BusinessExpense {
  id?: string;
  description: string;
  amount: string;
  date: string;
  category: string;
  payment_method: string;
  reference: string;
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useBusinessExpenses = () => {
  const queryClient = useQueryClient();
  const { user } = useApp();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['business-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching business expenses:', error);
        toast.error('Erro ao carregar despesas');
        return [];
      }

      return data as BusinessExpense[];
    },
  });

  const createExpense = useMutation({
    mutationFn: async (expense: Omit<BusinessExpense, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('business_expenses')
        .insert([{ ...expense, user_id: user?.id }])
        .select();

      if (error) {
        console.error('Error creating expense:', error);
        throw error;
      }

      return data[0] as BusinessExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Despesa adicionada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar despesa: ${error.message}`);
    },
  });

  const updateExpense = useMutation({
    mutationFn: async (expense: BusinessExpense) => {
      const { id, created_at, updated_at, ...rest } = expense;
      const { data, error } = await supabase
        .from('business_expenses')
        .update(rest)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating expense:', error);
        throw error;
      }

      return data[0] as BusinessExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Despesa atualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar despesa: ${error.message}`);
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Despesa excluída com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir despesa: ${error.message}`);
    },
  });

  // Calculate summary statistics
  const totalAmount = expenses.reduce((sum, expense) => {
    return sum + parseFloat(expense.amount || '0');
  }, 0);

  const categorySummary = expenses.reduce((acc, expense) => {
    const category = expense.category;
    const amount = parseFloat(expense.amount || '0');
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);

  const statusSummary = expenses.reduce((acc, expense) => {
    const status = expense.status;
    
    if (!acc[status]) {
      acc[status] = 0;
    }
    
    acc[status] += 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    expenses,
    isLoading,
    createExpense,
    updateExpense,
    deleteExpense,
    totalAmount,
    categorySummary,
    statusSummary,
  };
};
