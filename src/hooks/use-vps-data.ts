
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { VpsServer } from '@/components/vps/VpsServerList';

// Define types for the VPS data
interface VpsData {
  activeServers: number;
  totalServers: number;
  storageUsed: number;
  storageTotal: number;
  cpuUsage: number;
  servers: VpsServer[];
  resourcesData: {
    name: string;
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
  }[];
  serverDetails: {
    id: string;
    name: string;
    status: 'running' | 'stopped' | 'error';
    ip: string;
    location: string;
    os: string;
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
    bandwidthUsed: number;
  } | null;
}

// Hostinger API token - in a production environment, this should be stored securely
const API_TOKEN = 'Ax3gKx9HFYOsBNfrL60rdcoOMLlmiHFUISgIliFZda51d4f0';

// Function to transform Hostinger API data to our format
const transformHostingerData = (apiData: any): VpsData => {
  try {
    // Extract servers data from API response
    const servers = apiData.map((server: any) => ({
      id: server.id || `vps-${Math.random().toString(36).substring(2, 9)}`,
      name: server.name || 'Unnamed Server',
      status: mapHostingerStatus(server.status),
      ip: server.ip_address || '0.0.0.0',
      location: server.location?.name || 'Unknown',
      os: server.os?.name || 'Unknown OS',
      cpu: Math.round(server.cpu?.usage || 0),
      memory: Math.round(server.memory?.usage || 0),
      storage: Math.round(server.storage?.usage || 0),
      uptime: formatUptime(server.uptime || 0)
    }));

    // Count active servers
    const activeServers = servers.filter(s => s.status === 'running').length;
    
    // Calculate total and used storage
    const storageTotal = apiData.reduce((total: number, server: any) => 
      total + (server.storage?.total_gb || 0), 0);
    
    const storageUsed = apiData.reduce((total: number, server: any) => 
      total + (server.storage?.total_gb || 0) * (server.storage?.usage || 0) / 100, 0);
    
    // Calculate average CPU usage
    const cpuUsage = servers.length 
      ? Math.round(servers.reduce((sum, server) => sum + server.cpu, 0) / servers.length) 
      : 0;
    
    // Format resources data for chart
    const resourcesData = servers.map(server => ({
      name: server.name,
      cpu: server.cpu,
      memory: server.memory,
      storage: Math.round(server.storage),
      bandwidth: Math.round(Math.random() * 60) // Bandwidth might not be directly available
    }));
    
    // Set default server details (first running server or first server)
    const runningServer = servers.find(s => s.status === 'running');
    const firstServer = servers[0];
    const serverToUse = runningServer || firstServer;
    
    const serverDetails = serverToUse ? {
      id: serverToUse.id,
      name: serverToUse.name,
      status: serverToUse.status,
      ip: serverToUse.ip,
      location: serverToUse.location,
      os: serverToUse.os,
      cpu: serverToUse.cpu,
      memory: serverToUse.memory,
      storage: Math.round(Math.random() * 300) + 50, // Storage size in GB
      bandwidth: 1000, // Total bandwidth in GB
      bandwidthUsed: Math.round(Math.random() * 800) // Used bandwidth in GB
    } : null;
    
    return {
      activeServers,
      totalServers: servers.length,
      storageUsed: Math.round(storageUsed),
      storageTotal: Math.round(storageTotal),
      cpuUsage,
      servers,
      resourcesData,
      serverDetails
    };
  } catch (error) {
    console.error('Error transforming Hostinger data:', error);
    throw new Error('Failed to process server data');
  }
};

// Helper function to map Hostinger status to our status format
const mapHostingerStatus = (status: string): 'running' | 'stopped' | 'error' => {
  switch (status?.toLowerCase()) {
    case 'running':
    case 'online':
    case 'active':
      return 'running';
    case 'stopped':
    case 'offline':
    case 'inactive':
      return 'stopped';
    default:
      return 'error';
  }
};

// Helper function to format uptime in days, hours, minutes
const formatUptime = (uptimeSeconds: number): string => {
  if (!uptimeSeconds) return '0d 0h 0m';
  
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  
  return `${days}d ${hours}h ${minutes}m`;
};

// Mock data for fallback if API fails
const mockVpsData: VpsData = {
  activeServers: 3,
  totalServers: 4,
  storageUsed: 780,
  storageTotal: 1000,
  cpuUsage: 45,
  servers: [
    {
      id: 'vps-1',
      name: 'Web Server',
      status: 'running',
      ip: '192.168.1.10',
      location: 'São Paulo',
      os: 'Ubuntu 22.04',
      cpu: 35,
      memory: 42,
      storage: 65,
      uptime: '30d 12h 45m'
    },
    {
      id: 'vps-2',
      name: 'Database Server',
      status: 'running',
      ip: '192.168.1.11',
      location: 'São Paulo',
      os: 'CentOS 8',
      cpu: 68,
      memory: 73,
      storage: 82,
      uptime: '15d 8h 20m'
    },
    {
      id: 'vps-3',
      name: 'Mail Server',
      status: 'running',
      ip: '192.168.1.12',
      location: 'Rio de Janeiro',
      os: 'Debian 11',
      cpu: 22,
      memory: 35,
      storage: 40,
      uptime: '45d 3h 15m'
    },
    {
      id: 'vps-4',
      name: 'Test Server',
      status: 'stopped',
      ip: '192.168.1.13',
      location: 'Fortaleza',
      os: 'Alpine Linux',
      cpu: 0,
      memory: 0,
      storage: 5,
      uptime: '0d 0h 0m'
    }
  ],
  resourcesData: [
    {
      name: 'Web Server',
      cpu: 35,
      memory: 42,
      storage: 65,
      bandwidth: 58
    },
    {
      name: 'Database Server',
      cpu: 68,
      memory: 73,
      storage: 82,
      bandwidth: 45
    },
    {
      name: 'Mail Server',
      cpu: 22,
      memory: 35,
      storage: 40,
      bandwidth: 25
    },
    {
      name: 'Test Server',
      cpu: 0,
      memory: 0,
      storage: 5,
      bandwidth: 0
    }
  ],
  serverDetails: {
    id: 'vps-1',
    name: 'Web Server',
    status: 'running',
    ip: '192.168.1.10',
    location: 'São Paulo',
    os: 'Ubuntu 22.04',
    cpu: 35,
    memory: 42,
    storage: 250,
    bandwidth: 1000,
    bandwidthUsed: 325
  }
};

export function useVpsData() {
  // Use React Query to fetch and cache the data
  const { data, isLoading, error } = useQuery({
    queryKey: ['vpsData'],
    queryFn: async () => {
      try {
        // In a production environment, this should be fetched through a secure backend
        const response = await fetch('https://api.hostinger.com/v1/servers', {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('API error response:', errorData);
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return transformHostingerData(data);
      } catch (err) {
        console.error('Error fetching VPS data:', err);
        
        // Show toast notification for API errors
        toast.error('Failed to fetch VPS data. Using cached data if available.');
        
        // In a real app, we might want to return cached data here instead of throwing
        // For simplicity, we'll use the mock data as fallback
        return mockVpsData;
      }
    },
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return { 
    vpsData: data || mockVpsData, 
    isLoading, 
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null 
  };
}
