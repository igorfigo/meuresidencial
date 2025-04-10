
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Interface para os dados da VPS retornados pela API
export interface VpsData {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    in: number;
    out: number;
  };
  uptime: number;
  hostname: string;
  status: string;
}

export const useVpsData = () => {
  const [data, setData] = useState<VpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(60000); // 1 minuto por padrão
  
  const API_KEY = '5Cvw75ULSNzImFlD7MPXUgXDJBEUZ9YcHBYUHadz722c895d';

  const fetchVpsData = async () => {
    try {
      setLoading(true);
      
      // Endpoint da API Hostinger - Ajuste conforme documentação oficial
      const response = await fetch('https://api.hostinger.com/v1/vps/status', {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      setData(responseData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching VPS data:', err);
      setError(err.message || 'Failed to fetch VPS data');
      toast.error('Failed to fetch VPS data. Please check API key and connection.');
    } finally {
      setLoading(false);
    }
  };

  // Função para alterar o intervalo de atualização
  const changeRefreshInterval = (interval: number) => {
    setRefreshInterval(interval);
  };

  // Buscar dados iniciais e configurar o intervalo de atualização
  useEffect(() => {
    fetchVpsData();
    
    const intervalId = setInterval(() => {
      fetchVpsData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  return { 
    data, 
    loading, 
    error,
    refresh: fetchVpsData,
    changeRefreshInterval
  };
};
