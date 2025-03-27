
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

// Business Expense type definition
export interface BusinessExpense {
  id: string;
  title: string;
  category: string;
  vendor: string;
  amount: number;
  payment_date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useBusinessExpenses() {
  const queryClient = useQueryClient();
  
  // Fetch expenses from Supabase
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['business-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_expenses')
        .select('*')
        .order('payment_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        toast.error('Error loading expenses');
        throw error;
      }
      
      return data as BusinessExpense[];
    }
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (newExpense: Omit<BusinessExpense, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('business_expenses')
        .insert([newExpense])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating expense:', error);
        toast.error('Error creating expense');
        throw error;
      }
      
      return data as BusinessExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Expense created successfully');
    }
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, expense }: { id: string, expense: Partial<BusinessExpense> }) => {
      const { data, error } = await supabase
        .from('business_expenses')
        .update(expense)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating expense:', error);
        toast.error('Error updating expense');
        throw error;
      }
      
      return data as BusinessExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Expense updated successfully');
    }
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from('business_expenses')
        .delete()
        .eq('id', expenseId);
      
      if (error) {
        console.error('Error deleting expense:', error);
        toast.error('Error deleting expense');
        throw error;
      }
      
      return expenseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Expense deleted successfully');
    }
  });

  const createExpense = async (expense: Omit<BusinessExpense, 'id' | 'created_at' | 'updated_at'>) => {
    return createExpenseMutation.mutateAsync(expense);
  };

  const updateExpense = async (id: string, expense: Partial<BusinessExpense>) => {
    return updateExpenseMutation.mutateAsync({ id, expense });
  };

  const deleteExpense = async (expenseId: string) => {
    return deleteExpenseMutation.mutateAsync(expenseId);
  };

  return {
    expenses,
    isLoading,
    createExpense,
    updateExpense,
    deleteExpense
  };
}
