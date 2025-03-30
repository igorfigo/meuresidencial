
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useVPSMonitor } from '@/hooks/use-vps-monitor';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  RefreshCw,
  Server,
  Cpu,
  HardDrive,
  AreaChart,
  Globe,
  Clock,
  Activity
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const VPSMonitor: React.FC = () => {
  const { 
    vpsData, 
    isLoading, 
    isError, 
    refetch,
    helpers
  } = useVPSMonitor();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-lg font-medium">Carregando dados do VPS...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Erro ao carregar dados</h2>
          <p className="text-red-700 mb-4">
            Não foi possível carregar os dados do servidor VPS. Verifique sua conexão ou API key.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">VPS Monitor</h1>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            Monitoramento em tempo real dos servidores VPS da Hostinger. Visualize recursos, desempenho e status.
          </p>
        </div>
        
        <Separator className="my-4" />
        
        {vpsData.length === 0 ? (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Nenhum servidor VPS encontrado</h2>
            <p className="text-yellow-700">
              Não foram encontrados servidores VPS vinculados à sua conta Hostinger.
            </p>
          </div>
        ) : (
          <Tabs defaultValue={vpsData[0].id.toString()}>
            <TabsList className="mb-4">
              {vpsData.map((vm) => (
                <TabsTrigger key={vm.id} value={vm.id.toString()}>
                  {vm.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {vpsData.map((vm) => (
              <TabsContent key={vm.id} value={vm.id.toString()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Server Info Card */}
                  <Card className="border-t-4 border-t-blue-600 shadow-md">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-blue-500" />
                        <CardTitle>Informações do Servidor</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nome</p>
                          <p className="font-medium">{vm.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${vm.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="capitalize">{vm.status}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Sistema Operacional</p>
                          <p className="font-medium">{vm.os.name} {vm.os.version}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Localização</p>
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span>{vm.location.name}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-500">Endereço IP</p>
                          <div className="flex flex-wrap gap-2">
                            {vm.ip_addresses && vm.ip_addresses.map((ip, idx) => (
                              <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm">{ip}</span>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-500">Criado em</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{format(new Date(vm.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Resources Usage Card */}
                  <Card className="border-t-4 border-t-green-600 shadow-md">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <CardTitle>Uso de Recursos</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">CPU</span>
                            <span className="text-sm font-medium">{helpers.calculateCpuUsage(vm)}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Cpu className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <Progress value={helpers.calculateCpuUsage(vm)} className="h-2" />
                            </div>
                            <span className="text-xs font-medium">{vm.resources.cpu_cores} Cores</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Memória</span>
                            <span className="text-sm font-medium">{helpers.calculateRamUsage(vm)}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <HardDrive className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <Progress value={helpers.calculateRamUsage(vm)} className="h-2" />
                            </div>
                            <span className="text-xs font-medium">{(vm.resources.ram_mb / 1024).toFixed(1)} GB</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Disco</span>
                            <span className="text-sm font-medium">{helpers.calculateDiskUsage(vm)}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <HardDrive className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <Progress value={helpers.calculateDiskUsage(vm)} className="h-2" />
                            </div>
                            <span className="text-xs font-medium">{(vm.resources.disk_mb / 1024 / 1024).toFixed(0)} GB</span>
                          </div>
                        </div>
                        
                        {vm.bandwidth && (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Uso de Banda</span>
                              <span className="text-sm font-medium">{helpers.calculateBandwidthUsage(vm).toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <AreaChart className="h-4 w-4 text-gray-500" />
                              <div className="flex-1">
                                <Progress value={helpers.calculateBandwidthUsage(vm)} className="h-2" />
                              </div>
                              <span className="text-xs font-medium">
                                {helpers.formatBandwidth(vm.bandwidth.used_bytes)} / {helpers.formatBandwidth(vm.bandwidth.total_bytes)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VPSMonitor;
