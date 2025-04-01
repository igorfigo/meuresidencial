
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

const fetchVpsData = async (): Promise<{
  vpsData: VpsData;
  vpsStatus: string;
  cpuUsageHistory: UsageHistoryPoint[];
  ramUsageHistory: UsageHistoryPoint[];
  diskUsageHistory: UsageHistoryPoint[];
  bandwidthUsageHistory: BandwidthPoint[];
}> => {
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

    const vpsData = data as VpsData;
    
    // Generate historical data
    const { 
      cpuUsageHistory, 
      ramUsageHistory, 
      diskUsageHistory, 
      bandwidthUsageHistory 
    } = generateHistoricalData();

    return {
      vpsData,
      vpsStatus: vpsData.status,
      cpuUsageHistory,
      ramUsageHistory,
      diskUsageHistory,
      bandwidthUsageHistory,
    };
  } catch (error) {
    console.error('Error in fetchVpsData:', error);
    throw error;
  }
};

// Extract historical data generation to a separate function
const generateHistoricalData = () => {
  // Generate time points for the charts
  const generateTimePoints = (count: number): string[] => {
    const times: string[] = [];
    const now = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 15 * 60 * 1000); // 15 minute intervals
      times.push(format(date, 'HH:mm', { locale: ptBR }));
    }
    
    return times;
  };

  const timePoints = generateTimePoints(24); // Last 6 hours in 15-minute intervals
  
  const cpuUsageHistory: UsageHistoryPoint[] = timePoints.map((time) => ({
    time,
    usage: Math.floor(Math.random() * 60) + 5,
  }));
  
  const ramUsageHistory: UsageHistoryPoint[] = timePoints.map((time) => ({
    time,
    usage: Math.floor(Math.random() * 40) + 20,
  }));
  
  const diskUsageHistory: UsageHistoryPoint[] = timePoints.map((time) => ({
    time,
    usage: Math.floor(Math.random() * 10) + 25,
  }));
  
  // Generate bandwidth data for the last 7 days
  const generateDates = (count: number): string[] => {
    const dates: string[] = [];
    const now = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Daily intervals
      dates.push(format(date, 'dd/MM', { locale: ptBR }));
    }
    
    return dates;
  };

  const datePoints = generateDates(7);
  
  const bandwidthUsageHistory: BandwidthPoint[] = datePoints.map((date) => ({
    date,
    download: Math.floor(Math.random() * 10 + 1) * 1024 * 1024 * 1024, // 1-10 GB
    upload: Math.floor(Math.random() * 5 + 1) * 1024 * 1024 * 1024, // 1-5 GB
  }));

  return {
    cpuUsageHistory,
    ramUsageHistory,
    diskUsageHistory,
    bandwidthUsageHistory
  };
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

  return {
    vpsData: data?.vpsData,
    vpsStatus: data?.vpsStatus || 'unknown',
    cpuUsageHistory: data?.cpuUsageHistory || [],
    ramUsageHistory: data?.ramUsageHistory || [],
    diskUsageHistory: data?.diskUsageHistory || [],
    bandwidthUsageHistory: data?.bandwidthUsageHistory || [],
    isLoading,
    isError,
    lastUpdated: formattedLastUpdated,
    refetch,
  };
};
