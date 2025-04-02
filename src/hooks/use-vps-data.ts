
import { useState, useEffect } from 'react';
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

// Mock data for development (this will be replaced with actual API data)
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

// Hostinger API token
const API_TOKEN = 'Ax3gKx9HFYOsBNfrL60rdcoOMLlmiHFUISgIliFZda51d4f0';

export function useVpsData() {
  const [vpsData, setVpsData] = useState<VpsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVpsData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a production environment, this API call should be made through a backend service
        // to protect your API token. For demonstration purposes, we're using mock data.
        
        /* 
        // Real API call would look something like this:
        const response = await fetch('https://developers.hostinger.com/api/vps/v1/virtual-machines', {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        // Process and transform the API data as needed
        */
        
        // For now, use mock data
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setVpsData(mockVpsData);
      } catch (err) {
        console.error('Error fetching VPS data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch VPS data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVpsData();
  }, []);

  return { vpsData, isLoading, error };
}
