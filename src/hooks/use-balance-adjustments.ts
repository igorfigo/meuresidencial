
import { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { getBalanceAdjustments } from '@/integrations/supabase/client';

export interface BalanceAdjustment {
  id?: string;
  matricula: string;
  adjustment_date: string;
  previous_balance: string;
  new_balance: string;
  reason: string;
  created_by?: string;
  created_at?: string;
}

export const useBalanceAdjustments = () => {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [adjustments, setAdjustments] = useState<BalanceAdjustment[]>([]);

  const fetchAdjustments = async () => {
    if (!user?.selectedCondominium) return;
    
    setIsLoading(true);
    try {
      const data = await getBalanceAdjustments(user.selectedCondominium);
      setAdjustments(data);
    } catch (error) {
      console.error('Error fetching balance adjustments:', error);
      toast.error('Erro ao carregar ajustes de saldo');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    adjustments,
    fetchAdjustments
  };
};
