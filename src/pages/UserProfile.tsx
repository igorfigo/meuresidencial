
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { PasswordChangeSection } from '@/components/minha-assinatura/PasswordChangeSection';
import { toast } from 'sonner';
import { ProfileCondominiumInfo } from '@/components/profile/ProfileCondominiumInfo';
import { ProfileRepresentativeInfo } from '@/components/profile/ProfileRepresentativeInfo';

const UserProfile = () => {
  const { user, isAuthenticated } = useApp();
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

  if (!isAuthenticated || !user || user.isAdmin) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
          <p>Esta página está disponível apenas para usuários de condomínios.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        
        {isLoading ? (
          <Card className="p-6 mb-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            </div>
          </Card>
        ) : condominiumData ? (
          <>
            <ProfileCondominiumInfo condominiumData={condominiumData} />
            <ProfileRepresentativeInfo condominiumData={condominiumData} />
            <PasswordChangeSection userMatricula={user.matricula} />
          </>
        ) : (
          <Card className="p-6 mb-6">
            <p>Nenhuma informação disponível</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
