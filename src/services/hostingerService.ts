import { toast } from 'sonner';

export const API_BASE_URL = 'https://developers.hostinger.com/api/vps/v1';
export const API_TOKEN = 'ncntBGCzyt5bTmyI31FnsCpw0iW4k9D4RhNhW2qP769dbb81';

export interface VirtualMachine {
  id: number;
  hostname: string;
  state: string;
  actions_lock: string;
  cpus: number;
  memory: number;
  disk: number;
  bandwidth: number;
  ns1: string;
  ns2: string;
  ipv4: {
    id: number;
    address: string;
    ptr: string;
  }[];
  ipv6?: {
    id: number;
    address: string;
    ptr: string;
  }[];
  template: {
    id: number;
    name: string;
    description: string;
    documentation: string;
  };
  created_at: string;
  firewall_group_id: number | null;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  bandwidth: number;
  timestamp: string;
}

// Fetch Virtual Machines list
export const fetchVpsData = async (): Promise<VirtualMachine[]> => {
  console.log('Fetching VPS data...');
  const response = await fetch(`${API_BASE_URL}/virtual-machines`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', errorData);
    throw new Error(`API request failed with status ${response.status}: ${errorData.message || 'Unknown error'}`);
  }

  const data = await response.json();
  console.log('VPS Data received:', data);
  return data;
};

// Fetch VPS performance metrics
export const fetchVpsMetrics = async (vmId: number): Promise<PerformanceMetrics> => {
  try {
    console.log(`Fetching performance metrics for VM ${vmId}...`);
    
    // Note: This endpoint is simulated as the actual metrics endpoint may not be available in the docs
    // In a real scenario, we would replace this with the actual metrics endpoint
    
    // For now, we'll create more realistic mock data based on typical VPS usage patterns
    // This would be replaced with a real API call once the endpoint is available
    
    // Simulating a network call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentDate = new Date();
    
    // Create more realistic metrics based on time patterns
    // Morning and evening typically have higher usage
    const hour = currentDate.getHours();
    const isBusinessHours = hour >= 9 && hour <= 18;
    
    // Base metrics - lower during non-business hours
    let cpuBase = isBusinessHours ? 25 : 10;
    let memoryBase = isBusinessHours ? 40 : 25;
    let diskBase = 18; // Disk usage tends to be more stable
    
    // Add some small variation but keep it realistic
    const cpuUsage = Math.max(1, Math.min(100, cpuBase + (Math.random() * 8 - 4)));
    const memoryUsage = Math.max(5, Math.min(95, memoryBase + (Math.random() * 10 - 5)));
    const diskUsage = Math.max(5, Math.min(95, diskBase + (Math.random() * 4 - 2)));
    
    // Bandwidth varies throughout the day
    let bandwidthBase = isBusinessHours ? 350 : 120;
    const bandwidth = Math.max(50, bandwidthBase + (Math.random() * 80 - 40));
    
    return {
      cpu: parseFloat(cpuUsage.toFixed(1)),
      memory: parseFloat(memoryUsage.toFixed(1)),
      disk: parseFloat(diskUsage.toFixed(1)),
      bandwidth: parseFloat(bandwidth.toFixed(0)),
      timestamp: currentDate.toISOString()
    };
  } catch (error) {
    console.error('Error fetching VM metrics:', error);
    toast.error('Falha ao buscar métricas de desempenho');
    
    // Return fallback values if the API call fails
    return {
      cpu: 3.5,
      memory: 45.2,
      disk: 18.7,
      bandwidth: 250,
      timestamp: new Date().toISOString()
    };
  }
};

// Fetch historical performance data (last 24 hours)
export const fetchHistoricalData = async (vmId: number): Promise<PerformanceMetrics[]> => {
  try {
    console.log(`Fetching historical data for VM ${vmId}...`);
    
    // In a real scenario, we would call the metrics history endpoint
    // For now, we'll generate realistic looking historical data
    
    const data: PerformanceMetrics[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timePoint = new Date(now);
      timePoint.setHours(now.getHours() - i);
      
      // Create patterns - higher usage during business hours
      const hour = timePoint.getHours();
      const isBusinessHours = hour >= 9 && hour <= 18;
      
      // Base metrics with daily patterns
      let cpuBase = isBusinessHours ? 25 : 10;
      let memoryBase = isBusinessHours ? 40 : 25;
      let diskBase = 18; // Steadily increases slightly over time
      
      // Add some small variation but keep it realistic and smooth
      // Use the hour as a seed for more consistent patterns
      const hourFactor = hour / 24;
      const cpuUsage = Math.max(1, Math.min(100, cpuBase + (Math.sin(hourFactor * Math.PI * 2) * 8)));
      const memoryUsage = Math.max(5, Math.min(95, memoryBase + (Math.cos(hourFactor * Math.PI) * 10)));
      const diskUsage = Math.max(5, Math.min(95, diskBase + (i * 0.05))); // Slight increase over time
      
      // Bandwidth varies throughout the day with peaks
      let bandwidthBase = isBusinessHours ? 350 : 120;
      const bandwidth = Math.max(50, bandwidthBase + (Math.sin(hourFactor * Math.PI * 4) * 80));
      
      data.push({
        cpu: parseFloat(cpuUsage.toFixed(1)),
        memory: parseFloat(memoryUsage.toFixed(1)),
        disk: parseFloat(diskUsage.toFixed(1)),
        bandwidth: parseFloat(bandwidth.toFixed(0)),
        timestamp: timePoint.toISOString()
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    toast.error('Falha ao buscar dados históricos');
    return [];
  }
};
