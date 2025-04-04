
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlans } from '@/hooks/use-plans';
import { Separator } from '@/components/ui/separator';
import { SubscriptionDetailsCard } from '@/components/minha-assinatura/SubscriptionDetailsCard';
import { PasswordChangeSection } from '@/components/minha-assinatura/PasswordChangeSection';
import { AccountInfoSection } from '@/components/minha-assinatura/AccountInfoSection';
import { formatCurrencyDisplay, getCurrentPlanDetails } from '@/utils/subscription-utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreditCard, Info } from 'lucide-react';

const MinhaAssinatura = () => {
  const { user, isAuthenticated } = useApp();
  const { plans, isLoading: isLoadingPlans } = usePlans();
  const isMobile = useIsMobile();
  
  const [isLoading, setIsLoading] = useState(false);
  const [condominiumData, setCondominiumData] = useState<any>(null);
  const [pixDueDate, setPixDueDate] = useState<string>('');
  
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
      
      // Fetch PIX key information
      const { data: pixData, error: pixError } = await supabase
        .from('pix_key_meuresidencial')
        .select('diavencimento')
        .single();
        
      if (pixError && pixError.code !== 'PGRST116') {
        console.error('Error fetching PIX data:', pixError);
      }
      
      if (pixData) {
        setPixDueDate(pixData.diavencimento);
      }
      
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
  
  const getPlanDetails = () => {
    return getCurrentPlanDetails(condominiumData, plans);
  };

  // Function to handle plan update from the SubscriptionDetailsCard
  const handlePlanUpdate = (updatedData: any) => {
    setCondominiumData(updatedData);
  };

  // Check if the user is a manager (not admin and not resident)
  const isManager = isAuthenticated && user && !user.isAdmin && !user.isResident;

  if (!isAuthenticated || !user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-4 px-3 max-w-full">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-brand-600" />
            <h1 className="text-xl font-bold">Minha Assinatura</h1>
          </div>
          <Separator className="mb-4" />
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-600">
              Você precisa estar autenticado para acessar esta página.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (user.isAdmin) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-4 px-3 max-w-full">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-brand-600" />
            <h1 className="text-xl font-bold">Minha Assinatura</h1>
          </div>
          <Separator className="mb-4" />
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">
                Esta página está disponível apenas para usuários de condomínios.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (user.isResident) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-4 px-3 max-w-full">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-brand-600" />
            <h1 className="text-xl font-bold">Minha Assinatura</h1>
          </div>
          <Separator className="mb-4" />
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">
                Esta página está disponível apenas para administradores de condomínios.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 px-3 max-w-full">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-5 w-5 text-brand-600" />
          <h1 className="text-xl font-bold">Minha Assinatura</h1>
        </div>
        <Separator className="mb-4" />
        
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-pulse flex flex-col gap-4 w-full">
              <div className="h-24 bg-gray-200 rounded-md w-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-48 bg-gray-200 rounded-md w-full"></div>
                <div className="h-48 bg-gray-200 rounded-md w-full"></div>
              </div>
            </div>
          </div>
        ) : condominiumData ? (
          <div className="grid grid-cols-1 gap-4">
            <SubscriptionDetailsCard 
              condominiumData={condominiumData}
              user={{ matricula: user.matricula, email: user.email }}
              formatCurrencyDisplay={formatCurrencyDisplay}
              getCurrentPlanDetails={getPlanDetails}
              pixDueDate={pixDueDate}
              onPlanUpdate={handlePlanUpdate}
              isMobile={isMobile}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AccountInfoSection 
                condominiumData={condominiumData} 
                userMatricula={user.matricula} 
              />
              <PasswordChangeSection 
                userMatricula={user.matricula} 
              />
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <p>Carregando informações...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MinhaAssinatura;
