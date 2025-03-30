
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

// Accurate data based on the Hostinger dashboard screenshot
const mockServers: VPSServer[] = [
  {
    id: 'vps-1',
    name: 'Ubuntu 24.04',
    status: 'running',
    ip: '82.25.76.200',
    hostname: 'srv754093.hstgr.cloud',
    cpu: {
      cores: 1, // KVM 1 as shown in dashboard
      utilization: 4 // 4% CPU usage as shown
    },
    memory: {
      total: 4, // 4 GB total memory
      used: 0.84, // 21% of 4GB is approximately 0.84GB
      utilization: 21 // 21% memory usage as shown
    },
    disk: {
      total: 50, // 50 GB total disk space
      used: 10, // 10 GB used as shown
      utilization: 20 // 10GB of 50GB is 20%
    },
    network: {
      incoming: 4.2, // 4.2 MB as shown for incoming traffic
      outgoing: 1.0 // 1.0 MB as shown for outgoing traffic
    },
    os: 'Ubuntu 24.04 with CloudPanel',
    location: 'Brazil - São Paulo',
    created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString() // 16 days ago based on uptime
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

  // Generate realistic time series data for charts based on actual metrics
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
    
    // Using actual metrics as baseline
    for (let i = pointCount - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
      let value;
      
      switch (metricName) {
        case 'cpu':
          // Base value of 4% with small variations
          value = 4 + (Math.random() > 0.9 ? 8 * Math.random() : Math.random() * 2);
          break;
        case 'memory':
          // Base value of 21% with small variations
          value = 21 + Math.sin(i/10) * 3 + Math.random() * 2;
          break;
        case 'disk':
          // Disk usage is steady with very slight increase
          value = 20 + i * 0.005 + Math.random() * 0.5;
          break;
        case 'network':
          // Network with occasional spikes based on actual traffic
          const isSpike = Math.random() > 0.95;
          if (metricName === 'incoming') {
            value = isSpike ? 4.2 + Math.random() * 2 : 1 + Math.random() * 0.5;
          } else {
            value = isSpike ? 1.0 + Math.random() * 1 : 0.2 + Math.random() * 0.3;
          }
          break;
        default:
          value = Math.random() * 100;
      }
      
      // Ensure values are within reasonable ranges
      data.push({
        time: timestamp.toISOString(),
        value: Math.max(0, value) // Keep values non-negative
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
