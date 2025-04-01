
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
  // First, get the API key from our database
  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from('api_keys')
    .select('api_key')
    .eq('service_name', 'hostinger')
    .single();

  if (apiKeyError) {
    throw new Error('Failed to get API key: ' + apiKeyError.message);
  }

  const apiKey = apiKeyData.api_key;

  // For now, we're mocking the data as we don't have the real Hostinger API endpoint
  // In a real implementation, you would make an actual fetch call to the Hostinger API
  
  // Simulate a little delay to mimic a real API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate mock data
  const currentCpuUsage = Math.floor(Math.random() * 40) + 10; // 10-50%
  const currentRamUsage = Math.floor(Math.random() * 30) + 20; // 20-50%
  const currentDiskUsage = Math.floor(Math.random() * 30) + 10; // 10-40%

  // Mock VPS data
  const vpsData: VpsData = {
    hostname: 'vps123.hostinger.com',
    ipAddress: '123.456.789.012',
    status: 'running',
    os: 'Ubuntu 22.04 LTS',
    uptime: '10 days, 5 hours',
    dataCenter: 'São Paulo, Brazil',
    plan: 'Cloud Hosting Premium',
    cpu: {
      cores: 4,
      model: 'Intel Xeon E5-2680 v3',
      usage: currentCpuUsage,
    },
    memory: {
      total: 8 * 1024 * 1024 * 1024, // 8 GB
      used: (8 * 1024 * 1024 * 1024) * (currentRamUsage / 100),
      free: (8 * 1024 * 1024 * 1024) * (1 - currentRamUsage / 100),
      usagePercent: currentRamUsage,
    },
    disk: {
      total: 100 * 1024 * 1024 * 1024, // 100 GB
      used: (100 * 1024 * 1024 * 1024) * (currentDiskUsage / 100),
      free: (100 * 1024 * 1024 * 1024) * (1 - currentDiskUsage / 100),
      usagePercent: currentDiskUsage,
    },
    bandwidth: {
      total: 2 * 1024 * 1024 * 1024 * 1024, // 2 TB
      used: 500 * 1024 * 1024 * 1024, // 500 GB
      remaining: 1.5 * 1024 * 1024 * 1024 * 1024, // 1.5 TB
      usagePercent: 25,
    },
  };

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
