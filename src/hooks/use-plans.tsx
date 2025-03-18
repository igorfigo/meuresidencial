import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatToBRL } from '@/utils/currency';

export interface Plan {
  id?: string;
  codigo: string;
  nome: string;
  descricao?: string;
  valor: string;
  created_at?: string;
  updated_at?: string;
}

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .order('nome', { ascending: true });

      if (fetchError) throw new Error(fetchError.message);
      
      // Format the values to Brazilian currency format
      const formattedData = data?.map(plan => ({
        ...plan,
        valor: formatToBRL(plan.valor)
      })) || [];
      
      setPlans(formattedData);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching plans'));
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanValue = (codigo: string): string => {
    const plan = plans.find(p => p.codigo === codigo);
    return plan?.valor || 'R$ 0,00';
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    isLoading,
    error,
    fetchPlans,
    getPlanValue,
  };
};
