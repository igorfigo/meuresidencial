
import { toast } from "sonner";

export interface VirtualMachine {
  id: number;
  name: string;
  status: string;
  os: {
    name: string;
    version: string;
  };
  ip_addresses: string[];
  resources: {
    cpu_cores: number;
    ram_mb: number;
    disk_mb: number;
  };
  location: {
    id: number;
    name: string;
  };
  bandwidth: {
    used_bytes: number;
    total_bytes: number;
  };
  created_at: string;
}

export interface HostingerApiResponse {
  data: VirtualMachine[];
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

export const fetchVPSData = async (): Promise<VirtualMachine[]> => {
  try {
    const response = await fetch("https://developers.hostinger.com/api/vps/v1/virtual-machines", {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer kNWYYq5tg47H40SZLD6CfDsNKAveGlvdYKhzmRPG758fc693',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: HostingerApiResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching VPS data:", error);
    toast.error("Falha ao buscar dados do VPS. Verifique o console para mais detalhes.");
    return [];
  }
};
