
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    // Call the Supabase Edge Function to get VPS data
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw new Error('Not authenticated');
    }

    const accessToken = sessionData?.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Call the edge function with proper authorization header
    const { data, error } = await supabase.functions.invoke('getVpsData', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (error) {
      console.error('Error calling getVpsData function:', error);
      throw new Error('Failed to fetch VPS data: ' + error.message);
    }

    if (!data) {
      throw new Error('No data returned from getVpsData function');
    }

    const vpsData = data as VpsData;
    
    // Simulate a little delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate historical data for CPU usage
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

export const useVpsData = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['vpsData'],
    queryFn: fetchVpsData,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    staleTime: 1000 * 60 * 4, // Consider data stale after 4 minutes
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
