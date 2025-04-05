
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlans } from '@/hooks/use-plans';
import { Separator } from '@/components/ui/separator';
import { SubscriptionDetailsCard } from '@/components/minha-assinatura/SubscriptionDetailsCard';
import { formatCurrencyDisplay, getCurrentPlanDetails } from '@/utils/subscription-utils';
import { CreditCard, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MinhaAssinatura = () => {
  const { user, isAuthenticated } = useApp();
  const { plans, isLoading: isLoadingPlans } = usePlans();
  const navigate = useNavigate();
  
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
        <div className="container mx-auto py-6 px-4 w-full max-w-none">
          <h1 className="text-2xl font-bold mb-2">Minha Assinatura</h1>
          <Separator className="mb-2" />
          <p className="text-gray-600 mb-6">
            Gerencie os detalhes da sua assinatura, plano contratado e informações de pagamento.
          </p>
          <p>Você precisa estar autenticado para acessar esta página.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (user.isAdmin) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 w-full max-w-none">
          <h1 className="text-2xl font-bold mb-2">Minha Assinatura</h1>
          <Separator className="mb-2" />
          <p className="text-gray-600 mb-6">
            Gerencie os detalhes da sua assinatura, plano contratado e informações de pagamento.
          </p>
          <p>Esta página está disponível apenas para usuários de condomínios.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (user.isResident) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 w-full max-w-none">
          <h1 className="text-2xl font-bold mb-2">Minha Assinatura</h1>
          <Separator className="mb-2" />
          <p className="text-gray-600 mb-6">
            Gerencie os detalhes da sua assinatura, plano contratado e informações de pagamento.
          </p>
          <p>Esta página está disponível apenas para administradores de condomínios.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 w-full max-w-none">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-brand-600" />
            <h1 className="text-2xl font-bold">Minha Assinatura</h1>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-brand-200 hover:bg-brand-50 hover:border-brand-300"
            onClick={() => navigate('/contato')}
          >
            <LifeBuoy className="h-4 w-4 text-brand-600" />
            <span>Suporte</span>
          </Button>
        </div>
        <Separator className="mb-2" />
        
        <p className="text-gray-600 mb-6">
          Gerencie os detalhes da sua assinatura, plano contratado e informações de pagamento.
        </p>
        
        {isLoading ? (
          <div className="w-full space-y-4">
            <div className="animate-pulse h-[300px] bg-gray-100 rounded-lg w-full"></div>
          </div>
        ) : condominiumData ? (
          <SubscriptionDetailsCard 
            condominiumData={condominiumData}
            user={{ matricula: user.matricula, email: user.email }}
            formatCurrencyDisplay={formatCurrencyDisplay}
            getCurrentPlanDetails={getPlanDetails}
            pixDueDate={pixDueDate}
            onPlanUpdate={handlePlanUpdate}
          />
        ) : (
          <div className="p-6 border rounded-lg shadow-sm bg-gray-50 text-center">
            <p>Nenhuma informação de assinatura disponível.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MinhaAssinatura;
