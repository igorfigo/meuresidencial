
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface VpsData {
  hostname: string;
  ipAddress: string;
  status: string;
  os: string;
  uptime: string;
  dataCenter: string;
  plan: string;
  cpu: {
    cores: number;
    model: string;
    usage: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  bandwidth: {
    total: number;
    used: number;
    remaining: number;
    usagePercent: number;
  };
  cpuUsageHistory: UsageHistoryPoint[];
  ramUsageHistory: UsageHistoryPoint[];
  diskUsageHistory: UsageHistoryPoint[];
  bandwidthUsageHistory: BandwidthPoint[];
  _fallback?: boolean;
}

interface UsageHistoryPoint {
  time: string;
  usage: number;
}

interface BandwidthPoint {
  date: string;
  download: number;
  upload: number;
}

const fetchVpsData = async (): Promise<VpsData> => {
  try {
    // Since this is an admin-only function, we'll check local storage for admin status
    const userString = localStorage.getItem('user');
    if (!userString) {
      throw new Error('Usuário não autenticado');
    }

    const user = JSON.parse(userString);
    if (!user.isAdmin) {
      throw new Error('Acesso restrito a administradores');
    }

    // Call the edge function directly
    const { data, error } = await supabase.functions.invoke('getVpsData');
    
    if (error) {
      console.error('Error calling getVpsData function:', error);
      throw new Error(`Falha ao buscar dados do VPS: ${error.message}`);
    }

    if (!data) {
      throw new Error('Nenhum dado retornado da função getVpsData');
    }

    // The data should already have the correct format from the edge function
    return data as VpsData;
  } catch (error) {
    console.error('Error in fetchVpsData:', error);
    throw error;
  }
};

export const useVpsData = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['vpsData'],
    queryFn: fetchVpsData,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    staleTime: 1000 * 60 * 4, // Consider data stale after 4 minutes
    retry: 1,
    meta: {
      onError: (error: Error) => {
        toast.error('Erro ao carregar dados do VPS');
        console.error('Error fetching VPS data:', error);
      }
    }
  });

  const formattedLastUpdated = data 
    ? format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })
    : 'N/A';

  // Check if we're using fallback data
  const isUsingFallback = data?._fallback === true;

  return {
    vpsData: data,
    vpsStatus: data?.status || 'unknown',
    cpuUsageHistory: data?.cpuUsageHistory || [],
    ramUsageHistory: data?.ramUsageHistory || [],
    diskUsageHistory: data?.diskUsageHistory || [],
    bandwidthUsageHistory: data?.bandwidthUsageHistory || [],
    isLoading,
    isError,
    isUsingFallback,
    lastUpdated: formattedLastUpdated,
    refetch,
  };
};
