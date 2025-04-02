
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Power, 
  RefreshCw, 
  Server, 
  Network, 
  HardDrive, 
  Cpu, 
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServerDetails {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  ip: string;
  location: string;
  os: string;
  cpu: number;
  memory: number;
  storage: number;
  bandwidth: number;
  bandwidthUsed: number;
}

interface VpsDetailsCardProps {
  serverDetails: ServerDetails | null;
}

const VpsDetailsCard: React.FC<VpsDetailsCardProps> = ({ 
  serverDetails
}) => {
  if (!serverDetails) {
    return (
      <Card className="h-full border-t-4 border-t-blue-600 shadow-md">
        <CardHeader>
          <CardTitle>Detalhes do Servidor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Server className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-muted-foreground">
              Selecione um servidor para ver detalhes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isRunning = serverDetails.status === 'running';
  const bandwidthPercentage = Math.round((serverDetails.bandwidthUsed / serverDetails.bandwidth) * 100);

  return (
    <Card className="h-full border-t-4 border-t-blue-600 shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{serverDetails.name}</span>
          <div className={cn(
            "h-2 w-2 rounded-full",
            isRunning ? "bg-green-500" : "bg-red-500"
          )} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between space-x-2">
          <Button 
            variant={isRunning ? "destructive" : "default"} 
            size="sm" 
            className="flex-1"
          >
            <Power className="h-4 w-4 mr-2" />
            {isRunning ? 'Parar' : 'Iniciar'}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1 flex items-center">
                <Server className="h-3 w-3 mr-1" /> IP
              </span>
              <span className="text-sm font-medium">{serverDetails.ip}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1 flex items-center">
                <Network className="h-3 w-3 mr-1" /> Localização
              </span>
              <span className="text-sm font-medium">{serverDetails.location}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1 flex items-center">
                <Database className="h-3 w-3 mr-1" /> SO
              </span>
              <span className="text-sm font-medium">{serverDetails.os}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1 flex items-center">
                <HardDrive className="h-3 w-3 mr-1" /> Armazenamento
              </span>
              <span className="text-sm font-medium">{serverDetails.storage} GB</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Cpu className="h-3 w-3 mr-1" /> CPU
                </span>
                <span className="text-xs font-medium">{serverDetails.cpu}%</span>
              </div>
              <Progress value={serverDetails.cpu} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Database className="h-3 w-3 mr-1" /> Memória
                </span>
                <span className="text-xs font-medium">{serverDetails.memory}%</span>
              </div>
              <Progress value={serverDetails.memory} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Network className="h-3 w-3 mr-1" /> Banda
                </span>
                <span className="text-xs font-medium">
                  {serverDetails.bandwidthUsed} GB / {serverDetails.bandwidth} GB
                </span>
              </div>
              <Progress value={bandwidthPercentage} className="h-2" />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="pt-2">
          <h4 className="text-sm font-medium mb-2">Ações Rápidas</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">Console</Button>
            <Button variant="outline" size="sm">Logs</Button>
            <Button variant="outline" size="sm">Backups</Button>
            <Button variant="outline" size="sm">Configurações</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VpsDetailsCard;
