
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BusinessExpense {
  id: string;
  description: string;
  amount: string;
  category: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface NewBusinessExpense {
  description: string;
  amount: string;
  category: string;
  date: string;
  notes: string;
}

export const useBusinessExpenses = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Fetch business expenses
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['business-expenses'],
    queryFn: async (): Promise<BusinessExpense[]> => {
      try {
        setError(null);
        const { data, error } = await supabase
          .from('business_expenses')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          throw new Error(`Erro ao buscar despesas: ${error.message}`);
        }

        return data || [];
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setError(new Error(errorMessage));
        console.error('Error fetching business expenses:', error);
        return [];
      }
    },
  });

  // Add a new business expense
  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense: NewBusinessExpense) => {
      const { data, error } = await supabase
        .from('business_expenses')
        .insert([{
          description: newExpense.description,
          amount: newExpense.amount,
          category: newExpense.category,
          date: newExpense.date,
          notes: newExpense.notes,
        }])
        .select()
        .single();

      if (error) {
        if (error.message.includes('violates row-level security policy')) {
          throw new Error('Você não tem permissão para adicionar despesas empresariais');
        } else if (error.message.includes('infinite recursion')) {
          throw new Error('Erro de configuração no banco de dados. Por favor, contate o administrador.');
        } else {
          throw new Error(`Erro ao adicionar despesa: ${error.message}`);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      toast.success('Despesa adicionada com sucesso!');
    },
    onError: (error) => {
      console.error('Error adding business expense:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar despesa');
    },
  });

  const addExpense = async (newExpense: NewBusinessExpense) => {
    return addExpenseMutation.mutateAsync(newExpense);
  };

  return {
    expenses,
    isLoading,
    error,
    addExpense,
  };
};
