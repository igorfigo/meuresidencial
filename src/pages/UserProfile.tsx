
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordChangeSection } from '@/components/minha-assinatura/PasswordChangeSection';
import { toast } from 'sonner';
import { ProfileCondominiumInfo } from '@/components/profile/ProfileCondominiumInfo';
import { ProfileRepresentativeInfo } from '@/components/profile/ProfileRepresentativeInfo';
import { AlertCircle, UserCog } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const UserProfile = () => {
  const { user, isAuthenticated } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [condominiumData, setCondominiumData] = useState<any>(null);
  const isMobile = useIsMobile();
  
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

  // Show restricted access message for residents
  if (isAuthenticated && user?.isResident) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-4 px-4 w-full">
          <div className="flex items-center gap-2 mb-4">
            <UserCog className="h-5 w-5 text-brand-600" />
            <h1 className="text-xl sm:text-2xl font-bold">Meu Perfil</h1>
          </div>
          
          <div className="border-t pt-3 mb-4"></div>
          
          <Card className="p-4 border-l-4 border-l-amber-500 border-t-4 border-t-brand-600 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-base mb-1.5">Acesso Restrito</h3>
                <p className="text-gray-600 text-sm">
                  Para atualizar suas informações de perfil, 
                  entre em contato com o administrador do seu condomínio.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-4 px-4 w-full">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Meu Perfil</h1>
          <p className="text-sm">Esta página está disponível apenas para usuários autenticados.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 px-4 w-full">
        <div className="flex items-center gap-2 mb-4">
          <UserCog className="h-5 w-5 text-brand-600" />
          <h1 className="text-xl sm:text-2xl font-bold">Meu Perfil</h1>
        </div>
        
        <div className="border-t pt-3 mb-4"></div>
        
        {isLoading ? (
          <Card className="p-4 mb-4 border-t-4 border-t-brand-600 shadow-sm w-full">
            <div className="animate-pulse w-full">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            </div>
          </Card>
        ) : condominiumData ? (
          <div className="grid grid-cols-1 gap-4 w-full">
            <ProfileCondominiumInfo condominiumData={condominiumData} />
            <ProfileRepresentativeInfo condominiumData={condominiumData} />
            <PasswordChangeSection userMatricula={user.matricula} />
          </div>
        ) : (
          <Card className="p-4 mb-4 border-t-4 border-t-brand-600 shadow-sm w-full">
            <p className="text-sm">Nenhuma informação disponível</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
