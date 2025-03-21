
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
  reason?: string; // Make reason optional since it doesn't exist in the database
  observations?: string | null; // Add observations field which exists in the database
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
      
      // Map database fields to our interface
      const mappedData: BalanceAdjustment[] = data.map(item => ({
        id: item.id,
        matricula: item.matricula,
        adjustment_date: item.adjustment_date,
        previous_balance: item.previous_balance,
        new_balance: item.new_balance,
        reason: item.observations || undefined, // Map observations to reason
        observations: item.observations,
        created_at: item.created_at
      }));
      
      setAdjustments(mappedData);
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
