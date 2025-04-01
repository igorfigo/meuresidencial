
import { formatToBRL } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';

export const formatCurrencyDisplay = (value: string | null | undefined): string => {
  if (!value) return 'R$ 0,00';
  
  if (value.startsWith('R$')) return value;
  
  return `R$ ${formatToBRL(Number(value))}`;
};

export const getCurrentPlanDetails = (condominiumData: any, plans: any[]) => {
  if (!condominiumData || !plans.length) return { name: '', value: 'R$ 0,00' };
  
  const planCode = condominiumData.planocontratado;
  const plan = plans.find(p => p.codigo === planCode);
  
  return {
    name: plan ? plan.nome : planCode || '',
    value: plan ? plan.valor : formatCurrencyDisplay(condominiumData.valorplano)
  };
};

export const getDueDateFromPix = async (): Promise<string> => {
  try {
    // Use supabase instead of fetch for consistency with the rest of the app
    const { data, error } = await supabase
      .from('pix_key_meuresidencial')
      .select('diavencimento')
      .single();
      
    if (error) throw error;
    return data?.diavencimento || '10';
  } catch (error) {
    console.error('Error fetching PIX due date:', error);
    return '10';
  }
};
