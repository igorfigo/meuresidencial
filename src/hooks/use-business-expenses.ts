
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface BusinessExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  vendor: string;
  payment_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useBusinessExpenses = () => {
  const queryClient = useQueryClient();

  // Fetch all business expenses
  const {
    data: expenses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['business-expenses'],
    queryFn: async (): Promise<BusinessExpense[]> => {
      const { data, error } = await supabase
        .from('business_expenses')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching business expenses:', error);
        throw error;
      }

      return data || [];
    },
  });

  // Add a new business expense
  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense: Omit<BusinessExpense, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('business_expenses')
        .insert([newExpense])
        .select()
        .single();

      if (error) {
        console.error('Error adding business expense:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Despesa adicionada com sucesso!');
    },
    onError: (error) => {
      console.error('Failed to add expense:', error);
      toast.error('Erro ao adicionar despesa. Tente novamente.');
    },
  });

  // Delete a business expense
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting business expense:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Despesa excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Failed to delete expense:', error);
      toast.error('Erro ao excluir despesa. Tente novamente.');
    },
  });

  const addExpense = (expenseData: Omit<BusinessExpense, 'id' | 'created_at' | 'updated_at'>) => {
    return addExpenseMutation.mutateAsync(expenseData);
  };

  const deleteExpense = (id: string) => {
    return deleteExpenseMutation.mutateAsync(id);
  };

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    deleteExpense,
  };
};
