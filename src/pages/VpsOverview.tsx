
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useVpsData } from '@/hooks/use-vps-data';
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  RefreshCw, 
  Network, 
  Clock, 
  Server,
  AlertTriangle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const VpsOverview: React.FC = () => {
  const { data, loading, error, refresh, changeRefreshInterval } = useVpsData();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Formatação para tamanho em bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Formatação para uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };
  
  // Dados para o gráfico do disco
  const getDiskData = () => {
    if (!data) return [];
    
    return [
      { name: 'Used', value: data.disk.used, color: '#FF8042' },
      { name: 'Free', value: data.disk.free, color: '#00C49F' }
    ];
  };
  
  // Dados para o gráfico de memória
  const getMemoryData = () => {
    if (!data) return [];
    
    return [
      { name: 'Used', value: data.memory.used, color: '#0088FE' },
      { name: 'Free', value: data.memory.free, color: '#00C49F' }
    ];
  };

  // Handler para mudar o intervalo de atualização
  const handleRefreshChange = (value: string) => {
    changeRefreshInterval(parseInt(value));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VPS Overview</h1>
            <p className="text-muted-foreground mt-1">
              Monitoramento e estatísticas da sua VPS na Hostinger
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select onValueChange={handleRefreshChange} defaultValue="60000">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Refresh interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10000">10 segundos</SelectItem>
                <SelectItem value="30000">30 segundos</SelectItem>
                <SelectItem value="60000">1 minuto</SelectItem>
                <SelectItem value="300000">5 minutos</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={refresh} variant="outline" className="flex gap-2 items-center">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {error ? (
          <Card className="border-red-300 shadow-md">
            <CardHeader className="bg-red-50 dark:bg-red-900/30">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                <CardTitle className="text-red-700 dark:text-red-300">Erro ao carregar dados</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Verifique sua API key ou a conexão com o servidor Hostinger.
              </p>
              <Button onClick={refresh} variant="outline" className="mt-4">
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="storage">Armazenamento</TabsTrigger>
              <TabsTrigger value="network">Rede</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="h-20 bg-gray-100 dark:bg-gray-800"></CardHeader>
                      <CardContent className="h-40 bg-gray-50 dark:bg-gray-700"></CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-t-4 border-t-blue-500 shadow-md">
                      <CardHeader>
                        <div className="flex items-center">
                          <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                          <CardTitle>CPU</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Utilização</span>
                            <span className="text-sm font-medium">{data?.cpu?.usage || 0}%</span>
                          </div>
                          <Progress value={data?.cpu?.usage || 0} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-2">
                            {data?.cpu?.cores || 0} cores disponíveis
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-t-4 border-t-green-500 shadow-md">
                      <CardHeader>
                        <div className="flex items-center">
                          <Database className="h-5 w-5 mr-2 text-green-500" />
                          <CardTitle>Memória</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Utilização</span>
                            <span className="text-sm font-medium">{data?.memory?.usage || 0}%</span>
                          </div>
                          <Progress value={data?.memory?.usage || 0} className="h-2" />
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Total</p>
                              <p className="text-sm font-medium">{data?.memory?.total ? formatBytes(data.memory.total) : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Livre</p>
                              <p className="text-sm font-medium">{data?.memory?.free ? formatBytes(data.memory.free) : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-t-4 border-t-orange-500 shadow-md">
                      <CardHeader>
                        <div className="flex items-center">
                          <HardDrive className="h-5 w-5 mr-2 text-orange-500" />
                          <CardTitle>Disco</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Utilização</span>
                            <span className="text-sm font-medium">{data?.disk?.usage || 0}%</span>
                          </div>
                          <Progress value={data?.disk?.usage || 0} className="h-2" />
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Total</p>
                              <p className="text-sm font-medium">{data?.disk?.total ? formatBytes(data.disk.total) : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Livre</p>
                              <p className="text-sm font-medium">{data?.disk?.free ? formatBytes(data.disk.free) : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-t-4 border-t-purple-500 shadow-md">
                      <CardHeader>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-purple-500" />
                          <CardTitle>Uptime</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center h-[82px]">
                          <div className="text-center">
                            <p className="text-2xl font-bold">
                              {data?.uptime ? formatUptime(data.uptime) : 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Status: <span className="font-medium text-green-500">{data?.status || 'Unknown'}</span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-md">
                      <CardHeader>
                        <div className="flex items-center">
                          <Database className="h-5 w-5 mr-2 text-blue-500" />
                          <CardTitle>Distribuição da Memória</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getMemoryData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getMemoryData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatBytes(value as number)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-md">
                      <CardHeader>
                        <div className="flex items-center">
                          <HardDrive className="h-5 w-5 mr-2 text-orange-500" />
                          <CardTitle>Distribuição do Disco</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getDiskData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getDiskData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatBytes(value as number)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-500" />
                    <CardTitle>CPU Performance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {data ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Server className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                          <h3 className="text-xl font-bold">{data.cpu.usage}% Utilização</h3>
                          <p className="text-muted-foreground mt-2">
                            {data.cpu.cores} cores disponíveis
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Carregando dados de performance...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="storage" className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center">
                    <HardDrive className="h-5 w-5 mr-2 text-orange-500" />
                    <CardTitle>Utilização de Armazenamento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {data ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Utilização Total</span>
                            <span>{data.disk.usage}%</span>
                          </div>
                          <Progress value={data.disk.usage} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Total</h4>
                            <p className="text-2xl font-bold">{formatBytes(data.disk.total)}</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Usado</h4>
                            <p className="text-2xl font-bold">{formatBytes(data.disk.used)}</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Livre</h4>
                            <p className="text-2xl font-bold">{formatBytes(data.disk.free)}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Carregando dados de armazenamento...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="network" className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center">
                    <Network className="h-5 w-5 mr-2 text-green-500" />
                    <CardTitle>Utilização da Rede</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {data ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-lg font-medium mb-4">Entrada de Dados</h4>
                          <p className="text-3xl font-bold">{formatBytes(data.network.in)}</p>
                          <p className="text-sm text-muted-foreground mt-2">Total recebido</p>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-lg font-medium mb-4">Saída de Dados</h4>
                          <p className="text-3xl font-bold">{formatBytes(data.network.out)}</p>
                          <p className="text-sm text-muted-foreground mt-2">Total enviado</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Carregando dados de rede...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VpsOverview;
