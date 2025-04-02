import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVpsData } from '@/hooks/use-vps-data';
import { Separator } from '@/components/ui/separator';
import { Server, HardDrive, Cpu, Activity, AlertTriangle } from 'lucide-react';
import VpsStatusCard from '@/components/vps/VpsStatusCard';
import VpsResourcesCard from '@/components/vps/VpsResourcesCard';
import VpsServerList from '@/components/vps/VpsServerList';
import VpsDetailsCard from '@/components/vps/VpsDetailsCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const VpsDashboard: React.FC = () => {
  const { vpsData, isLoading, error, isMockData, apiErrorDetails } = useVpsData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">VPS Management</h1>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            Painel de controle para monitoramento e gerenciamento de servidores VPS.
          </p>
        </div>
        
        {isMockData && (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Dados de exemplo</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Exibindo dados simulados. Não foi possível conectar à API da Hostinger.
              {apiErrorDetails && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Detalhes do erro</summary>
                  <p className="mt-1 text-sm">{apiErrorDetails}</p>
                  <p className="mt-1 text-sm">As requisições diretas do navegador para APIs externas geralmente são bloqueadas por CORS. Em produção, você deve criar um proxy no backend para estas chamadas.</p>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Separator className="my-4" />
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-10 w-10 animate-pulse text-blue-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando dados dos servidores VPS...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center text-red-500">
                <p className="font-medium">Erro ao carregar dados dos servidores VPS</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-9 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <VpsStatusCard 
                  icon={<Server className="h-5 w-5 text-blue-500" />}
                  title="Servidores Ativos"
                  value={vpsData?.activeServers || 0}
                  total={vpsData?.totalServers || 0}
                  status="online"
                />
                
                <VpsStatusCard 
                  icon={<HardDrive className="h-5 w-5 text-orange-500" />}
                  title="Armazenamento"
                  value={vpsData?.storageUsed || 0}
                  total={vpsData?.storageTotal || 0}
                  unit="GB"
                  status="warning"
                />
                
                <VpsStatusCard 
                  icon={<Cpu className="h-5 w-5 text-green-500" />}
                  title="CPU Média"
                  value={vpsData?.cpuUsage || 0}
                  total={100}
                  unit="%"
                  status="normal"
                />
              </div>
              
              <Card className="border-t-4 border-t-blue-600 shadow-md">
                <CardHeader>
                  <CardTitle>Recursos dos Servidores</CardTitle>
                  <CardDescription>
                    Utilização de recursos em todos os servidores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VpsResourcesCard data={vpsData?.resourcesData || []} />
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-blue-600 shadow-md">
                <CardHeader>
                  <CardTitle>Lista de Servidores</CardTitle>
                  <CardDescription>
                    Informações detalhadas sobre cada servidor VPS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VpsServerList servers={vpsData?.servers || []} />
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3">
              <VpsDetailsCard serverDetails={vpsData?.serverDetails || null} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VpsDashboard;
