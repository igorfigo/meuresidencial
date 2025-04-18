
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BusinessIncome {
  id: string;
  revenue_date: string;
  amount: number;
  full_identifier: string;
  system_code: string;
  manager_code: string;
  revenue_type: string;
  competency: string;
  created_at?: string;
  updated_at?: string;
}

export const useBusinessIncomes = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: incomesData = [], isLoading: isLoadingIncomes, error } = useQuery({
    queryKey: ['business-incomes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_incomes')
        .select('*')
        .order('revenue_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Filter and format the data
  const incomes = incomesData.map(item => ({
    ...item,
    revenue_date: new Date(item.revenue_date).toISOString().split('T')[0]
  }));

  // Mutation to create a new income
  const createIncomeMutation = useMutation({
    mutationFn: async (income: Omit<BusinessIncome, 'id' | 'created_at' | 'updated_at'>) => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('business_incomes')
        .insert(income)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-incomes'] });
      toast.success("Receita cadastrada com sucesso");
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Erro ao cadastrar receita:", error);
      toast.error("Erro ao cadastrar receita. Tente novamente.");
      setIsLoading(false);
    }
  });

  // Mutation to delete an income
  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsLoading(true);
      const { error } = await supabase
        .from('business_incomes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-incomes'] });
      toast.success("Receita excluída com sucesso");
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Erro ao excluir receita:", error);
      toast.error("Erro ao excluir receita");
      setIsLoading(false);
    }
  });

  return {
    incomes,
    isLoading: isLoading || isLoadingIncomes,
    error,
    createIncome: (income: Omit<BusinessIncome, 'id' | 'created_at' | 'updated_at'>) => 
      createIncomeMutation.mutate(income),
    deleteIncome: (id: string) => deleteIncomeMutation.mutate(id)
  };
};
