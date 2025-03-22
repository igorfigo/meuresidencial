
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlans } from '@/hooks/use-plans';
import { SubscriptionDetailsCard } from '@/components/minha-assinatura/SubscriptionDetailsCard';
import { formatCurrencyDisplay, getCurrentPlanDetails } from '@/utils/subscription-utils';

const MinhaAssinatura = () => {
  const { user, isAuthenticated } = useApp();
  const { plans, isLoading: isLoadingPlans } = usePlans();
  
  const [isLoading, setIsLoading] = useState(false);
  const [condominiumData, setCondominiumData] = useState<any>(null);
  
  const fetchCondominiumData = async (matricula: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .eq('matricula', matricula)
        .single();
        
      if (error) {
        throw error;
      }
      
      setCondominiumData(data);
    } catch (error) {
      console.error('Error fetching condominium data:', error);
      toast.error('Erro ao carregar dados do condomínio');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.matricula) {
      fetchCondominiumData(user.matricula);
    }
  }, [user]);
  
  // Create a wrapper function for getCurrentPlanDetails
  const getPlanDetails = () => {
    return getCurrentPlanDetails(condominiumData, plans);
  };

  if (!isAuthenticated || !user || user.isAdmin) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Minha Assinatura</h1>
          <p>Esta página está disponível apenas para usuários de condomínios.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Minha Assinatura</h1>
        
        {condominiumData && (
          <SubscriptionDetailsCard 
            condominiumData={condominiumData}
            user={{ matricula: user.matricula, email: user.email }}
            formatCurrencyDisplay={formatCurrencyDisplay}
            getCurrentPlanDetails={getPlanDetails}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MinhaAssinatura;
