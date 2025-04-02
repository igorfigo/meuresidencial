
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, PauseCircle, RefreshCw } from 'lucide-react';

export interface VpsServer {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  ip: string;
  location: string;
  os: string;
  cpu: number;
  memory: number;
  storage: number;
  uptime: string;
}

interface VpsServerListProps {
  servers: VpsServer[];
}

const statusMap = {
  running: { label: 'Online', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  stopped: { label: 'Parado', color: 'bg-orange-100 text-orange-800', icon: <PauseCircle className="h-4 w-4 text-orange-500" /> },
  error: { label: 'Erro', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
};

const VpsServerList: React.FC<VpsServerListProps> = ({ servers }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn(
            "h-4 w-4 mr-2", 
            isRefreshing && "animate-spin"
          )} />
          Atualizar
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Sistema</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>Memória</TableHead>
              <TableHead>Uptime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.length > 0 ? (
              servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">{server.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("flex w-24 justify-center items-center gap-1", statusMap[server.status].color)}>
                      {statusMap[server.status].icon}
                      {statusMap[server.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{server.ip}</TableCell>
                  <TableCell>{server.location}</TableCell>
                  <TableCell>{server.os}</TableCell>
                  <TableCell>{server.cpu}%</TableCell>
                  <TableCell>{server.memory}%</TableCell>
                  <TableCell>{server.uptime}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  Nenhum servidor VPS encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VpsServerList;
