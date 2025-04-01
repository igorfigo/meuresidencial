
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useVpsData } from '@/hooks/use-vps-data';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Network, 
  ClockIcon, 
  Globe,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const VpsOverview: React.FC = () => {
  const { 
    vpsData, 
    vpsStatus, 
    cpuUsageHistory, 
    ramUsageHistory, 
    diskUsageHistory, 
    bandwidthUsageHistory,
    isLoading, 
    isError, 
    isUsingFallback,
    lastUpdated,
    refetch
  } = useVpsData();

  const handleRefresh = () => {
    refetch();
    toast.success('Dados atualizados com sucesso');
  };

  if (isError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">VPS Overview</h1>
          </div>
          
          <Card className="p-6 border-l-4 border-red-500">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-lg mb-2">Erro ao carregar dados</h3>
                <p className="text-gray-600">
                  Não foi possível carregar os dados da VPS. Verifique se a API está funcionando corretamente.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VPS Overview</h1>
            <p className="text-muted-foreground">
              Monitoramento em tempo real do servidor VPS Hostinger
            </p>
          </div>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        {isUsingFallback && (
          <Alert className="bg-amber-50 border-amber-200 mb-4">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Usando dados de fallback</AlertTitle>
            <AlertDescription className="text-amber-700">
              Não foi possível conectar à API da Hostinger. Exibindo dados simulados para demonstração.
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-t-4 border-blue-600 shadow-md">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full" />
                  <div className="mt-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-t-4 border-blue-600 shadow-md">
                <CardHeader className="flex flex-row items-center pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">Status da VPS</CardTitle>
                    <CardDescription>
                      Hostinger Cloud
                    </CardDescription>
                  </div>
                  <Server className="ml-auto h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vpsStatus === 'running' && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Online
                      </Badge>
                    )}
                    {vpsStatus === 'stopped' && (
                      <Badge className="bg-red-500 hover:bg-red-600">
                        Offline
                      </Badge>
                    )}
                    {vpsStatus === 'starting' && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        Iniciando
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Última atualização: {lastUpdated}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-indigo-600 shadow-md">
                <CardHeader className="flex flex-row items-center pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">CPU</CardTitle>
                    <CardDescription>
                      vCPUs: {vpsData?.cpu?.cores || '-'}
                    </CardDescription>
                  </div>
                  <Cpu className="ml-auto h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">
                    {vpsData?.cpu?.usage || 0}%
                  </div>
                  <Progress 
                    value={vpsData?.cpu?.usage || 0} 
                    className={cn(
                      "h-2 mt-2",
                      vpsData?.cpu?.usage && vpsData.cpu.usage > 80 ? "bg-red-100" : "bg-gray-100"
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Modelo: {vpsData?.cpu?.model || 'Intel Xeon'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-green-600 shadow-md">
                <CardHeader className="flex flex-row items-center pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">Memória</CardTitle>
                    <CardDescription>
                      Total: {formatBytes(vpsData?.memory?.total || 0)}
                    </CardDescription>
                  </div>
                  <MemoryStick className="ml-auto h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {vpsData?.memory?.usagePercent || 0}%
                  </div>
                  <Progress 
                    value={vpsData?.memory?.usagePercent || 0} 
                    className={cn(
                      "h-2 mt-2",
                      vpsData?.memory?.usagePercent && vpsData.memory.usagePercent > 80 ? "bg-red-100" : "bg-gray-100"
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Usada: {formatBytes(vpsData?.memory?.used || 0)} de {formatBytes(vpsData?.memory?.total || 0)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-yellow-600 shadow-md">
                <CardHeader className="flex flex-row items-center pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">Disco</CardTitle>
                    <CardDescription>
                      Total: {formatBytes(vpsData?.disk?.total || 0)}
                    </CardDescription>
                  </div>
                  <HardDrive className="ml-auto h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {vpsData?.disk?.usagePercent || 0}%
                  </div>
                  <Progress 
                    value={vpsData?.disk?.usagePercent || 0} 
                    className={cn(
                      "h-2 mt-2",
                      vpsData?.disk?.usagePercent && vpsData.disk.usagePercent > 80 ? "bg-red-100" : "bg-gray-100"
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Usada: {formatBytes(vpsData?.disk?.used || 0)} de {formatBytes(vpsData?.disk?.total || 0)}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="border-t-4 border-purple-600 shadow-md">
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle>Histórico de CPU</CardTitle>
                    <Cpu className="ml-auto h-5 w-5 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={cpuUsageHistory}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="usage" 
                        name="CPU (%)" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-green-600 shadow-md">
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle>Histórico de Memória</CardTitle>
                    <MemoryStick className="ml-auto h-5 w-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={ramUsageHistory}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="usage" 
                        name="Memória (%)" 
                        stroke="#00C49F" 
                        fill="#00C49F" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="border-t-4 border-yellow-600 shadow-md">
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle>Histórico de Disco</CardTitle>
                    <HardDrive className="ml-auto h-5 w-5 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={diskUsageHistory}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="usage" 
                        name="Disco (%)" 
                        stroke="#FFBB28" 
                        fill="#FFBB28" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-blue-600 shadow-md">
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle>Uso de Banda</CardTitle>
                    <Network className="ml-auto h-5 w-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bandwidthUsageHistory}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => formatBytes(value, 2)} />
                      <Tooltip formatter={(value) => [formatBytes(value as number, 2), 'Banda']} />
                      <Legend />
                      <Bar dataKey="download" name="Download" fill="#0088FE" barSize={20} />
                      <Bar dataKey="upload" name="Upload" fill="#00C49F" barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mt-6">
              <Card className="border-t-4 border-slate-600 shadow-md">
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle>Informações do Sistema</CardTitle>
                    <ClockIcon className="ml-auto h-5 w-5 text-slate-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Hostname
                      </p>
                      <p className="text-base">{vpsData?.hostname || 'srv754093.hstgr.cloud'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Sistema Operacional
                      </p>
                      <p className="text-base">{vpsData?.os || 'Ubuntu 22.04 LTS'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Uptime
                      </p>
                      <p className="text-base">{vpsData?.uptime || '10 dias, 5 horas'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        IP Público
                      </p>
                      <p className="text-base">{vpsData?.ipAddress || '82.25.76.200'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        IPv6
                      </p>
                      <p className="text-base">{vpsData?.ipv6Address || '2a02:4780:14:1fa7::1'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Data Center
                      </p>
                      <p className="text-base">{vpsData?.dataCenter || 'Lithuania, EU'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Plano
                      </p>
                      <p className="text-base">{vpsData?.plan || 'Cloud Hosting VPS 4'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VpsOverview;
