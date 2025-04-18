
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

interface ManagerStats {
  activeCount: number;
  inactiveCount: number;
  inactiveLoginCount: number;
}

export const useManagerStats = () => {
  const [stats, setStats] = useState<ManagerStats>({
    activeCount: 0,
    inactiveCount: 0,
    inactiveLoginCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tenDaysAgo = subDays(new Date(), 10).toISOString();

        const { count: activeCount } = await supabase
          .from('condominiums')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true);

        const { count: inactiveCount } = await supabase
          .from('condominiums')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', false);

        const { count: inactiveLoginCount } = await supabase
          .from('user_roles')
          .select('user_id', { count: 'exact', head: true })
          .eq('role', 'manager')
          .lt('last_login', tenDaysAgo);

        setStats({
          activeCount: activeCount || 0,
          inactiveCount: inactiveCount || 0,
          inactiveLoginCount: inactiveLoginCount || 0
        });
      } catch (error) {
        console.error('Error fetching manager stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
};
