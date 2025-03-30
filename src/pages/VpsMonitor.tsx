
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Server, Activity, Database, Clock, Globe, Cpu, HardDrive, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchVpsData, 
  fetchVpsMetrics, 
  fetchHistoricalData, 
  VirtualMachine, 
  PerformanceMetrics 
} from '@/services/hostingerService';

interface FormattedPerformanceData {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
  bandwidth: number;
}

const VpsMonitor: React.FC = () => {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<FormattedPerformanceData[]>([]);
  const [activeVmId, setActiveVmId] = useState<number | null>(null);

  // Fetch VPS list data
  const { 
    data: vpsData, 
    isLoading: isLoadingVpsData, 
    error: vpsError 
  } = useQuery({
    queryKey: ['vps-data'],
    queryFn: fetchVpsData,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
    retry: 2,
    meta: {
      onError: (err: Error) => {
        console.error('Error fetching VPS data:', err);
        toast.error(`Falha ao buscar dados do VPS: ${err.message}`);
      }
    }
  });

  // Fetch current metrics
  const { 
    data: metrics, 
    isLoading: isLoadingMetrics,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['vps-metrics', activeVmId],
    queryFn: () => activeVmId ? fetchVpsMetrics(activeVmId) : Promise.resolve(null),
    enabled: !!activeVmId,
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
    meta: {
      onError: (err: Error) => {
        console.error('Error fetching metrics:', err);
        toast.error('Falha ao buscar métricas atuais');
      }
    }
  });

  // Fetch historical data
  const { 
    data: histData, 
    isLoading: isLoadingHistData 
  } = useQuery({
    queryKey: ['vps-historical-data', activeVmId],
    queryFn: () => activeVmId ? fetchHistoricalData(activeVmId) : Promise.resolve([]),
    enabled: !!activeVmId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // Refresh every 5 minutes
    meta: {
      onError: (err: Error) => {
        console.error('Error fetching historical data:', err);
        toast.error('Falha ao buscar dados históricos');
      }
    }
  });

  // Set active VM when data is loaded
  useEffect(() => {
    if (vpsData && vpsData.length > 0 && !activeVmId) {
      setActiveVmId(vpsData[0].id);
      console.log('Set active VM ID:', vpsData[0].id);
    }
  }, [vpsData, activeVmId]);

  // Update current metrics when data is fetched
  useEffect(() => {
    if (metrics) {
      setCurrentMetrics(metrics);
      console.log('Updated current metrics:', metrics);
    }
  }, [metrics]);

  // Format historical data for charts
  useEffect(() => {
    if (histData && histData.length > 0) {
      const formattedData = histData.map(point => ({
        time: new Date(point.timestamp).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        cpu: point.cpu,
        memory: point.memory,
        disk: point.disk,
        bandwidth: point.bandwidth
      }));
      
      setHistoricalData(formattedData);
      console.log('Updated historical data with', formattedData.length, 'points');
    }
  }, [histData]);

  // Refresh metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeVmId) {
        refetchMetrics();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeVmId, refetchMetrics]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getStatusColor = (state: string | undefined) => {
    if (!state) return 'bg-gray-500';
    
    switch (state.toLowerCase()) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'restarting':
      case 'rebuilding':
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

  // Log errors and responses for debugging
  useEffect(() => {
    if (vpsError) {
      console.error('VPS Data error:', vpsError);
    }
    if (vpsData) {
      console.log('VPS Data in component:', vpsData);
    }
  }, [vpsData, vpsError]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">VPS Monitor</h1>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            Monitore o status e o desempenho dos seus servidores VPS em tempo real.
          </p>
        </div>
        
        <Separator className="my-4" />
        
        {isLoadingVpsData ? (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-t-4 border-t-blue-600 shadow-md">
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
          </div>
        ) : vpsError ? (
          <Card className="border-t-4 border-t-red-600 shadow-md">
            <CardHeader>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                <CardTitle>Erro ao Carregar Dados</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>{(vpsError as Error).message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Verifique a sua conexão com a Internet e tente novamente mais tarde.
                Caso o problema persista, entre em contato com o suporte.
              </p>
            </CardContent>
          </Card>
        ) : !vpsData || vpsData.length === 0 ? (
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
          <div className="space-y-8">
            {vpsData.map((vm) => (
              <div key={vm.id} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card className="col-span-1 lg:col-span-12 border-t-4 border-t-blue-600 shadow-md">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          <Cpu className="h-4 w-4 mr-1" /> CPU
                        </div>
                        <Progress value={currentMetrics?.cpu || 0} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span>{currentMetrics?.cpu.toFixed(1) || '0.0'}% em uso</span>
                          <span>{vm.cpus} Cores</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          <Database className="h-4 w-4 mr-1" /> Memória
                        </div>
                        <Progress value={currentMetrics?.memory || 0} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span>{currentMetrics?.memory.toFixed(1) || '0.0'}% em uso</span>
                          <span>{formatBytes(vm.memory * 1024 * 1024)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          <HardDrive className="h-4 w-4 mr-1" /> Disco
                        </div>
                        <Progress value={currentMetrics?.disk || 0} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span>{currentMetrics?.disk.toFixed(1) || '0.0'}% em uso</span>
                          <span>{formatBytes(vm.disk * 1024 * 1024)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
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
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 lg:col-span-6">
                  <CardHeader>
                    <CardTitle>CPU Utilização</CardTitle>
                    <CardDescription>Utilização de CPU nas últimas 24 horas</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[250px]">
                      {isLoadingHistData ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-full w-full rounded-md" />
                        </div>
                      ) : (
                        <ChartContainer config={{
                          cpu: { label: "CPU", color: "#2563eb" }
                        }}>
                          <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis unit="%" domain={[0, 100]} />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  indicator="line"
                                />
                              }
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="cpu"
                              name="CPU"
                              stroke="var(--color-cpu)"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ChartContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 lg:col-span-6">
                  <CardHeader>
                    <CardTitle>Memória Utilização</CardTitle>
                    <CardDescription>Utilização de memória nas últimas 24 horas</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[250px]">
                      {isLoadingHistData ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-full w-full rounded-md" />
                        </div>
                      ) : (
                        <ChartContainer config={{
                          memory: { label: "Memória", color: "#10b981" }
                        }}>
                          <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis unit="%" domain={[0, 100]} />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  indicator="line"
                                />
                              }
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="memory"
                              name="Memória"
                              stroke="var(--color-memory)"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ChartContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 lg:col-span-6">
                  <CardHeader>
                    <CardTitle>Utilização de Disco</CardTitle>
                    <CardDescription>Utilização de disco nas últimas 24 horas</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[250px]">
                      {isLoadingHistData ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-full w-full rounded-md" />
                        </div>
                      ) : (
                        <ChartContainer config={{
                          disk: { label: "Disco", color: "#f59e0b" }
                        }}>
                          <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis unit="%" domain={[0, 100]} />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  indicator="line"
                                />
                              }
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="disk"
                              name="Disco"
                              stroke="var(--color-disk)"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ChartContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 lg:col-span-6">
                  <CardHeader>
                    <CardTitle>Bandwidth Utilização</CardTitle>
                    <CardDescription>Utilização de banda nas últimas 24 horas</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[250px]">
                      {isLoadingHistData ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-full w-full rounded-md" />
                        </div>
                      ) : (
                        <ChartContainer config={{
                          bandwidth: { label: "Banda", color: "#8b5cf6" }
                        }}>
                          <BarChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis unit=" MB" />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent />
                              }
                            />
                            <Legend />
                            <Bar
                              dataKey="bandwidth"
                              name="Banda"
                              fill="var(--color-bandwidth)"
                            />
                          </BarChart>
                        </ChartContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 lg:col-span-12">
                  <CardHeader>
                    <CardTitle>Informações Detalhadas</CardTitle>
                    <CardDescription>Especificações técnicas do servidor {vm.hostname}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Propriedade</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">ID do Servidor</TableCell>
                          <TableCell>{vm.id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Hostname</TableCell>
                          <TableCell>{vm.hostname}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Estado</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(vm.state)} text-white`}>
                              {vm.state}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Sistema Operacional</TableCell>
                          <TableCell>{vm.template?.name || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">CPU</TableCell>
                          <TableCell>{vm.cpus} Core(s)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Memória</TableCell>
                          <TableCell>{formatBytes(vm.memory * 1024 * 1024)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Armazenamento</TableCell>
                          <TableCell>{formatBytes(vm.disk * 1024 * 1024)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Largura de Banda</TableCell>
                          <TableCell>{formatBytes(vm.bandwidth * 1024)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">IPv4</TableCell>
                          <TableCell>{vm.ipv4?.[0]?.address || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">IPv6</TableCell>
                          <TableCell>{vm.ipv6?.[0]?.address || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Name Server 1</TableCell>
                          <TableCell>{vm.ns1 || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Name Server 2</TableCell>
                          <TableCell>{vm.ns2 || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Data de Criação</TableCell>
                          <TableCell>{vm.created_at ? formatDate(vm.created_at) : 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    
                    {vm.template?.description && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Descrição do Sistema</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {vm.template.description}
                        </p>
                        {vm.template.documentation && (
                          <a 
                            href={vm.template.documentation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-sm text-blue-500 hover:underline"
                          >
                            Documentação Oficial
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VpsMonitor;
