
import { useState, useEffect } from 'react';

interface VirtualMachine {
  id: string;
  label: string;
  status: string;
  ips: {
    ip: string;
    type: string;
  }[];
  cpu: {
    cores: number;
    usage: number;
  };
  memory: {
    total: number;
    used: number;
  };
  disk: {
    total: number;
    used: number;
  };
  bandwidth: {
    total: number;
    used: number;
  };
  datacenter: string;
  created_at: string;
}

interface VpsHookReturn {
  virtualMachines: VirtualMachine[];
  isLoading: boolean;
  error: Error | null;
  refreshData: () => void;
}

// Sample data based on the API we would use
const mockVirtualMachines: VirtualMachine[] = [
  {
    id: 'vm-1234567890',
    label: 'Web Server Production',
    status: 'running',
    ips: [{ ip: '123.45.67.89', type: 'public' }],
    cpu: { cores: 4, usage: 25 },
    memory: { total: 8192, used: 3584 },
    disk: { total: 80, used: 45 },
    bandwidth: { total: 3000, used: 1200 },
    datacenter: 'US East',
    created_at: '2023-01-15T12:30:00Z'
  },
  {
    id: 'vm-0987654321',
    label: 'Database Server',
    status: 'running',
    ips: [{ ip: '98.76.54.32', type: 'public' }],
    cpu: { cores: 8, usage: 42 },
    memory: { total: 16384, used: 12288 },
    disk: { total: 160, used: 95 },
    bandwidth: { total: 2000, used: 850 },
    datacenter: 'EU West',
    created_at: '2023-03-10T09:15:00Z'
  },
  {
    id: 'vm-2468101214',
    label: 'Development Server',
    status: 'stopped',
    ips: [{ ip: '45.67.89.12', type: 'public' }],
    cpu: { cores: 2, usage: 0 },
    memory: { total: 4096, used: 0 },
    disk: { total: 50, used: 22 },
    bandwidth: { total: 1000, used: 0 },
    datacenter: 'Asia Pacific',
    created_at: '2023-05-22T14:45:00Z'
  }
];

export function useVps(): VpsHookReturn {
  const [virtualMachines, setVirtualMachines] = useState<VirtualMachine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVpsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be an API call:
      // const response = await fetch('https://developers.hostinger.com/api/vps/v1/virtual-machines', {
      //   headers: {
      //     'Authorization': 'Bearer Ax3gKx9HFYOsBNfrL60rdcoOMLlmiHFUISgIliFZda51d4f0',
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();
      // setVirtualMachines(data);
      
      // Using mock data for now
      // Simulate network delay
      setTimeout(() => {
        setVirtualMachines(mockVirtualMachines);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch VPS data'));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVpsData();
  }, []);

  const refreshData = () => {
    fetchVpsData();
  };

  return { virtualMachines, isLoading, error, refreshData };
}
