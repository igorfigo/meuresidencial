
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

// Updated realistic data for server
const mockServers: VPSServer[] = [
  {
    id: 'vps-1',
    name: 'Servidor Meu Residencial',
    status: 'running',
    ip: '82.25.76.200',
    hostname: HOSTINGER_HOSTNAME,
    cpu: {
      cores: 2,
      utilization: 28
    },
    memory: {
      total: 4,
      used: 1.8,
      utilization: 45
    },
    disk: {
      total: 80,
      used: 32,
      utilization: 40
    },
    network: {
      incoming: 3.2,
      outgoing: 1.8
    },
    os: 'Ubuntu 22.04 LTS',
    location: 'Europe (Frankfurt)',
    created_at: '2024-01-10T10:15:00Z'
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

  // Generate more realistic time series data for charts
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
    
    // Use more realistic patterns for a small VPS server
    for (let i = pointCount - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
      let value;
      
      switch (metricName) {
        case 'cpu':
          // Lower baseline for CPU with occasional spikes
          value = 15 + 10 * Math.sin(i/8) + (Math.random() > 0.9 ? 30 * Math.random() : 0);
          break;
        case 'memory':
          // Memory gradually increasing and decreasing
          value = 40 + 8 * Math.sin(i/18) + Math.random() * 5;
          break;
        case 'disk':
          // Disk usage steady with slight increase
          value = 38 + i * 0.01 + Math.random() * 1;
          break;
        case 'network':
          // Network with daily patterns and occasional spikes
          value = 1.5 + 1 * Math.sin(i/12) + (Math.random() > 0.95 ? 4 * Math.random() : 0);
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

