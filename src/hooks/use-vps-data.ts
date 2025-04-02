
import { useState, useEffect } from 'react';

export interface VpsServer {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  ip: string;
  location: string;
  os: string;
  plan: string;
  lastReboot?: string;
}

export interface ServerDetails {
  id: string;
  uptime: string;
  cpu: number;
  ram: {
    used: number;
    total: number;
  };
  disk: {
    used: number;
    total: number;
  };
  bandwidth: {
    in: number;
    out: number;
  };
  processes: number;
}

export interface ResourceData {
  name: string;
  value: number;
  type: 'cpu' | 'ram' | 'disk' | 'bandwidth';
}

export interface VpsData {
  _isMock?: boolean;
  _error?: string;
  activeServers: number;
  totalServers: number;
  storageUsed: number;
  storageTotal: number;
  cpuUsage: number;
  servers: VpsServer[];
  resourcesData: ResourceData[];
  serverDetails: Record<string, ServerDetails>;
}

export const useVpsData = () => {
  const [data, setData] = useState<VpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiKey = 'Ax3gKx9HFYOsBNfrL60rdcoOMLlmiHFUISgIliFZda51d4f0';

  useEffect(() => {
    const fetchVpsData = async () => {
      setLoading(true);
      
      try {
        // Attempt to fetch real data from API
        const response = await fetch('https://api.hostinger.com/v1/servers', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const apiData = await response.json();
        
        // Transform the API data to our format
        const transformedData: VpsData = {
          activeServers: apiData.filter((server: any) => server.status === 'running').length,
          totalServers: apiData.length,
          storageUsed: 0, // Calculate from server details
          storageTotal: 0, // Calculate from server details
          cpuUsage: 0, // Calculate average
          servers: apiData.map((server: any) => ({
            id: server.id,
            name: server.name,
            status: server.status,
            ip: server.ip || '0.0.0.0',
            location: server.location || 'Unknown',
            os: server.os || 'Linux',
            plan: server.plan || 'Standard',
            lastReboot: server.last_reboot,
          })),
          resourcesData: [],
          serverDetails: {},
        };
        
        // Additional API calls for each server to get resource usage
        // This would be implemented in a real scenario
        
        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching VPS data:", err);
        
        // If API fails, use mock data as fallback
        const mockData: VpsData = {
          _isMock: true,
          _error: err instanceof Error ? err.message : 'Unknown error occurred',
          activeServers: 3,
          totalServers: 4,
          storageUsed: 120,
          storageTotal: 480,
          cpuUsage: 38,
          servers: [
            {
              id: 'vps-1',
              name: 'Web Server',
              status: 'running',
              ip: '192.168.1.1',
              location: 'US East',
              os: 'Ubuntu 22.04',
              plan: 'Premium',
              lastReboot: '2023-08-10T15:30:00Z',
            },
            {
              id: 'vps-2',
              name: 'Database Server',
              status: 'running',
              ip: '192.168.1.2',
              location: 'US West',
              os: 'CentOS 8',
              plan: 'Enterprise',
              lastReboot: '2023-07-30T12:00:00Z',
            },
            {
              id: 'vps-3',
              name: 'Dev Server',
              status: 'running',
              ip: '192.168.1.3',
              location: 'EU Central',
              os: 'Debian 11',
              plan: 'Standard',
              lastReboot: '2023-08-05T09:15:00Z',
            },
            {
              id: 'vps-4',
              name: 'Backup Server',
              status: 'stopped',
              ip: '192.168.1.4',
              location: 'Asia Pacific',
              os: 'Ubuntu 20.04',
              plan: 'Basic',
              lastReboot: '2023-07-15T18:45:00Z',
            },
          ],
          resourcesData: [
            { name: 'CPU', value: 38, type: 'cpu' },
            { name: 'RAM', value: 65, type: 'ram' },
            { name: 'Disk', value: 25, type: 'disk' },
            { name: 'Bandwidth', value: 42, type: 'bandwidth' },
          ],
          serverDetails: {
            'vps-1': {
              id: 'vps-1',
              uptime: '25d 10h 15m',
              cpu: 42,
              ram: { used: 3.2, total: 8 },
              disk: { used: 45, total: 120 },
              bandwidth: { in: 1.2, out: 4.5 },
              processes: 124,
            },
            'vps-2': {
              id: 'vps-2',
              uptime: '15d 6h 30m',
              cpu: 58,
              ram: { used: 12, total: 16 },
              disk: { used: 35, total: 240 },
              bandwidth: { in: 2.8, out: 3.2 },
              processes: 87,
            },
            'vps-3': {
              id: 'vps-3',
              uptime: '8d 2h 45m',
              cpu: 15,
              ram: { used: 1.5, total: 4 },
              disk: { used: 30, total: 80 },
              bandwidth: { in: 0.8, out: 1.2 },
              processes: 56,
            },
            'vps-4': {
              id: 'vps-4',
              uptime: '0d 0h 0m',
              cpu: 0,
              ram: { used: 0, total: 2 },
              disk: { used: 10, total: 40 },
              bandwidth: { in: 0, out: 0 },
              processes: 0,
            },
          },
        };
        
        setData(mockData);
        setError("Failed to fetch real VPS data. Using mock data instead.");
      } finally {
        setLoading(false);
      }
    };

    fetchVpsData();
  }, [apiKey]);

  return { 
    data, 
    loading, 
    error,
    isMockData: data?._isMock ?? false,
    errorDetails: data?._error
  };
};
