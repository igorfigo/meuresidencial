
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Hostinger API key
const HOSTINGER_API_KEY = 'aWdvLMMLSurB1aDIqIia1pG3dvdSxADixTjtryaUe3255bc2';
// Hostinger Server Hostname
const HOSTINGER_HOSTNAME = 'srv754093.hstgr.cloud';

export interface VPSServer {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'restarting' | 'error';
  ip: string;
  hostname: string;
  cpu: {
    cores: number;
    utilization: number;
  };
  memory: {
    total: number; // in GB
    used: number; // in GB
    utilization: number; // percentage
  };
  disk: {
    total: number; // in GB
    used: number; // in GB
    utilization: number; // percentage
  };
  network: {
    incoming: number; // in Mbps
    outgoing: number; // in Mbps
  };
  os: string;
  location: string;
  created_at: string;
}

// Example data for development/demo
const mockServers: VPSServer[] = [
  {
    id: 'vps-1',
    name: 'Production Server',
    status: 'running',
    ip: '82.25.76.200',
    hostname: HOSTINGER_HOSTNAME,
    cpu: {
      cores: 4,
      utilization: 35
    },
    memory: {
      total: 8,
      used: 4.3,
      utilization: 54
    },
    disk: {
      total: 100,
      used: 45,
      utilization: 45
    },
    network: {
      incoming: 6.8,
      outgoing: 3.5
    },
    os: 'Ubuntu 22.04 LTS',
    location: 'Europe (Helsinki)',
    created_at: '2023-01-15T14:30:00Z'
  }
];

export function useVPSMonitor() {
  // Since we only have one server, we can set the selected server ID directly
  const [selectedServerId, setSelectedServerId] = useState<string | null>('vps-1');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Fetch all VPS servers
  const { data: servers = [], isLoading: isLoadingServers, error: serversError } = useQuery({
    queryKey: ['vps-servers'],
    queryFn: async () => {
      try {
        // In a real implementation, we would make an API call to Hostinger
        // using the API key to fetch the actual servers
        console.log('Using Hostinger API Key:', HOSTINGER_API_KEY);
        
        // For now, return mock data
        return mockServers;
      } catch (error) {
        console.error('Error fetching VPS servers:', error);
        toast.error('Failed to fetch VPS servers data');
        return [];
      }
    },
  });

  // Get details for a single server
  const { data: serverDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['vps-server-details', selectedServerId, timeRange],
    queryFn: async () => {
      if (!selectedServerId) return null;
      
      try {
        // In a real implementation, we would make an API call to fetch detailed metrics
        // Mock: just return the server from the list
        return servers.find(server => server.id === selectedServerId) || null;
      } catch (error) {
        console.error('Error fetching server details:', error);
        toast.error('Failed to fetch server details');
        return null;
      }
    },
    enabled: !!selectedServerId && servers.length > 0,
  });

  // Generate some mock time series data for charts
  const generateTimeSeriesData = (range: '1h' | '24h' | '7d' | '30d', metricName: string) => {
    const now = new Date();
    const data = [];
    
    let pointCount;
    let intervalMinutes;
    
    switch (range) {
      case '1h':
        pointCount = 60;
        intervalMinutes = 1;
        break;
      case '24h':
        pointCount = 24;
        intervalMinutes = 60;
        break;
      case '7d':
        pointCount = 7*24;
        intervalMinutes = 60;
        break;
      case '30d':
        pointCount = 30;
        intervalMinutes = 60*24;
        break;
    }
    
    for (let i = pointCount - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
      let value;
      
      switch (metricName) {
        case 'cpu':
          // Simulate CPU usage with daily patterns
          value = 20 + 30 * Math.sin(i/12) + Math.random() * 15;
          break;
        case 'memory':
          // Memory tends to be more stable
          value = 50 + 15 * Math.sin(i/24) + Math.random() * 10;
          break;
        case 'disk':
          // Disk usage tends to increase slowly
          value = 30 + i * 0.05 + Math.random() * 2;
          break;
        case 'network':
          // Network traffic with spikes
          value = 3 + 2 * Math.sin(i/8) + (Math.random() > 0.9 ? 8 * Math.random() : 0);
          break;
        default:
          value = Math.random() * 100;
      }
      
      data.push({
        time: timestamp.toISOString(),
        value: Math.min(Math.max(0, value), 100) // Keep between 0-100
      });
    }
    
    return data;
  };

  const getMetricsData = (serverId: string, metricType: string) => {
    if (!serverId) return [];
    return generateTimeSeriesData(timeRange, metricType);
  };

  // Server operations
  const restartServer = async (serverId: string) => {
    try {
      // This would be an API call to restart the server
      console.log(`Restarting server ${serverId} using API key ${HOSTINGER_API_KEY}`);
      console.log(`Hostname: ${HOSTINGER_HOSTNAME}`);
      toast.success(`Server ${serverId} is restarting`);
      return true;
    } catch (error) {
      console.error('Error restarting server:', error);
      toast.error('Failed to restart server');
      return false;
    }
  };

  const stopServer = async (serverId: string) => {
    try {
      // This would be an API call to stop the server
      console.log(`Stopping server ${serverId} using API key ${HOSTINGER_API_KEY}`);
      console.log(`Hostname: ${HOSTINGER_HOSTNAME}`);
      toast.success(`Server ${serverId} is stopping`);
      return true;
    } catch (error) {
      console.error('Error stopping server:', error);
      toast.error('Failed to stop server');
      return false;
    }
  };

  const startServer = async (serverId: string) => {
    try {
      // This would be an API call to start the server
      console.log(`Starting server ${serverId} using API key ${HOSTINGER_API_KEY}`);
      console.log(`Hostname: ${HOSTINGER_HOSTNAME}`);
      toast.success(`Server ${serverId} is starting`);
      return true;
    } catch (error) {
      console.error('Error starting server:', error);
      toast.error('Failed to start server');
      return false;
    }
  };

  return {
    servers,
    isLoadingServers,
    serversError,
    selectedServerId, 
    setSelectedServerId,
    serverDetails,
    isLoadingDetails,
    timeRange,
    setTimeRange,
    getMetricsData,
    restartServer,
    stopServer,
    startServer
  };
}
