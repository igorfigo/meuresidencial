
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

// Add the missing getSubscriptionStatus function
export const getSubscriptionStatus = (user: any): string | null => {
  if (!user) return null;
  
  // Check if user has a subscription
  if (user.planId || user.nomePlano) {
    return 'active';
  }
  
  return 'inactive';
};
