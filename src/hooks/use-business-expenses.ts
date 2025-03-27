
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BusinessExpense {
  id: string;
  description: string;
  amount: string;
  category: string;
  expense_date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessExpenseFormData {
  description: string;
  amount: string;
  category: string;
  expense_date: string;
  notes?: string;
}

export const useBusinessExpenses = () => {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  
  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: ['business-expenses'],
    queryFn: async () => {
      // Cast the table name to any to bypass TypeScript errors temporarily
      // This is needed because the types haven't been updated to include business_expenses
      const { data, error } = await supabase
        .from('business_expenses' as any)
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching business expenses:', error);
        throw error;
      }

      // Explicitly cast the result to the correct type
      return (data as unknown) as BusinessExpense[];
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: BusinessExpenseFormData) => {
      // Cast the table name to any to bypass TypeScript errors temporarily
      const { data, error } = await supabase
        .from('business_expenses' as any)
        .insert([expenseData])
        .select();

      if (error) {
        console.error('Error creating expense:', error);
        setFormError(error.message);
        throw error;
      }

      // Explicitly cast the first item in the result array to the correct type
      return (data[0] as unknown) as BusinessExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Despesa adicionada com sucesso!');
      setFormError(null);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao adicionar despesa. Tente novamente.');
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      // Cast the table name to any to bypass TypeScript errors temporarily
      const { error } = await supabase
        .from('business_expenses' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Despesa removida com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover despesa. Tente novamente.');
    }
  });

  return {
    expenses,
    isLoading,
    error,
    formError,
    setFormError,
    createExpense: createExpenseMutation.mutate,
    isCreating: createExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutate,
    isDeleting: deleteExpenseMutation.isPending
  };
};
