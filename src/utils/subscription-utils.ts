
import { formatToBRL } from '@/utils/currency';

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

export const getDueDateFromPix = async () => {
  try {
    const { data, error } = await fetch('https://api.example.com/pix');
    if (error) throw error;
    return data?.diavencimento || '10';
  } catch (error) {
    console.error('Error fetching PIX due date:', error);
    return '10';
  }
};
