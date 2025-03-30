
import { useQuery } from "@tanstack/react-query";
import { fetchVPSData, VirtualMachine } from "@/services/vpsService";

export const useVPSMonitor = () => {
  const { 
    data: vpsData = [], 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery({
    queryKey: ['vps-data'],
    queryFn: fetchVPSData,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });

  // Helper functions to calculate percentages and format data
  const calculateCpuUsage = (vm: VirtualMachine) => {
    // This is a placeholder as the API doesn't provide CPU usage percentage
    // In a real scenario, you would use actual metrics
    return Math.floor(Math.random() * 60) + 10; // Random value between 10-70%
  };

  const calculateRamUsage = (vm: VirtualMachine) => {
    // This is a placeholder as the API doesn't provide RAM usage
    return Math.floor(Math.random() * 50) + 30; // Random value between 30-80%
  };

  const calculateDiskUsage = (vm: VirtualMachine) => {
    // This is a placeholder as the API doesn't provide disk usage percentage
    return Math.floor(Math.random() * 40) + 20; // Random value between 20-60%
  };

  const formatBandwidth = (bytes: number) => {
    const gigabytes = bytes / (1024 * 1024 * 1024);
    return gigabytes.toFixed(2) + ' GB';
  };

  const calculateBandwidthUsage = (vm: VirtualMachine) => {
    if (!vm.bandwidth) return 0;
    return (vm.bandwidth.used_bytes / vm.bandwidth.total_bytes) * 100;
  };

  return {
    vpsData,
    isLoading,
    isError,
    error,
    refetch,
    helpers: {
      calculateCpuUsage,
      calculateRamUsage,
      calculateDiskUsage,
      formatBandwidth,
      calculateBandwidthUsage
    }
  };
};
