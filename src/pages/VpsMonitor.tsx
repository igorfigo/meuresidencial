
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Server, Activity, Database, Clock, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VirtualMachine {
  id: string;
  hostname: string;
  state: string; // Note: the actual API returns 'state' not 'status'
  cpus: number;
  memory: number;
  disk: number;
  bandwidth: number;
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
}

const VpsMonitor: React.FC = () => {
  const [vpsData, setVpsData] = useState<VirtualMachine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVpsData = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, this API call should be made from a server/edge function
        // to protect the API key
        const response = await fetch('https://developers.hostinger.com/api/vps/v1/virtual-machines', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ncntBGCzyt5bTmyI31FnsCpw0iW4k9D4RhNhW2qP769dbb81',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('VPS Data:', data);
        
        setVpsData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching VPS data:', err);
        setError('Failed to fetch VPS data. Please try again later.');
        toast.error('Failed to fetch VPS data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVpsData();
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getStatusColor = (state: string | undefined) => {
    if (!state) return 'bg-gray-500'; // Handle case when state is undefined
    
    switch (state.toLowerCase()) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'restarting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">VPS Monitor</h1>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            Monitore o status e os recursos dos seus servidores VPS em tempo real.
          </p>
        </div>
        
        <Separator className="my-4" />
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="border-t-4 border-t-blue-600 shadow-md">
                <CardHeader className="pb-2">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-t-4 border-t-red-600 shadow-md">
            <CardHeader>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                <CardTitle>Erro ao Carregar Dados</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <p className="text-sm text-gray-500 mt-2">
                Verifique a sua conexão com a Internet e tente novamente mais tarde.
                Caso o problema persista, entre em contato com o suporte.
              </p>
            </CardContent>
          </Card>
        ) : vpsData.length === 0 ? (
          <Card className="border-t-4 border-t-yellow-600 shadow-md">
            <CardHeader>
              <div className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-yellow-500" />
                <CardTitle>Nenhum VPS Encontrado</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Não foi possível encontrar nenhum servidor VPS associado à sua conta.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vpsData.map((vm) => (
              <Card key={vm.id} className="border-t-4 border-t-blue-600 shadow-md overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Server className="h-5 w-5 mr-2 text-blue-500" />
                      <CardTitle>{vm.hostname}</CardTitle>
                    </div>
                    <Badge className={`${getStatusColor(vm.state)} text-white`}>
                      {vm.state}
                    </Badge>
                  </div>
                  <CardDescription>
                    {vm.template?.name || 'Sistema Operacional não especificado'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          <Activity className="h-4 w-4 mr-1" />
                          CPU
                        </div>
                        <div className="text-lg font-semibold">
                          {vm.cpus} Cores
                        </div>
                        {/* No CPU usage info provided by the API, so we'll show a static progress */}
                        <Progress 
                          value={0} 
                          className="h-2" 
                        />
                        <div className="text-xs text-right">
                          N/A
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          <Database className="h-4 w-4 mr-1" />
                          RAM
                        </div>
                        <div className="text-lg font-semibold">
                          {formatBytes(vm.memory * 1024 * 1024)}
                        </div>
                        {/* No RAM usage info provided by the API */}
                        <Progress 
                          value={0}
                          className="h-2" 
                        />
                        <div className="text-xs text-right">
                          N/A
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          <Database className="h-4 w-4 mr-1" />
                          Disk
                        </div>
                        <div className="text-lg font-semibold">
                          {formatBytes(vm.disk * 1024 * 1024)}
                        </div>
                        {/* No disk usage info provided by the API */}
                        <Progress 
                          value={0} 
                          className="h-2" 
                        />
                        <div className="text-xs text-right">
                          N/A
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          <Globe className="h-4 w-4 inline mr-1" /> IP
                        </div>
                        {vm.ipv4 && vm.ipv4.length > 0 && (
                          <div className="text-sm">
                            IPv4: {vm.ipv4[0].address || 'N/A'}
                          </div>
                        )}
                        {vm.ipv6 && vm.ipv6.length > 0 && (
                          <div className="text-sm truncate">
                            IPv6: {vm.ipv6[0].address || 'N/A'}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          <Clock className="h-4 w-4 inline mr-1" /> Criado em
                        </div>
                        <div className="text-sm">
                          {vm.created_at ? formatDate(vm.created_at) : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    {vm.bandwidth && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Largura de Banda
                        </div>
                        <Progress 
                          value={0} 
                          className="h-2" 
                        />
                        <div className="flex justify-between text-xs">
                          <span>Usado: N/A</span>
                          <span>Total: {formatBytes(vm.bandwidth * 1024)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VpsMonitor;
