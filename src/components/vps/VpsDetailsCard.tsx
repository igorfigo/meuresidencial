
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Cpu, HardDrive, Network, Memory } from 'lucide-react';
import { VpsStatusBadge } from './VpsStatusBadge';
import { format } from 'date-fns';

interface VpsDetailsCardProps {
  id: string;
  label: string;
  status: string;
  ips: { ip: string; type: string }[];
  cpu: { cores: number; usage: number };
  memory: { total: number; used: number };
  disk: { total: number; used: number };
  bandwidth: { total: number; used: number };
  datacenter: string;
  created_at: string;
}

export function VpsDetailsCard({
  id,
  label,
  status,
  ips,
  cpu,
  memory,
  disk,
  bandwidth,
  datacenter,
  created_at
}: VpsDetailsCardProps) {
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const formatGigabytes = (gb: number) => `${gb} GB`;
  
  // Calculate percentages
  const memoryPercentage = (memory.used / memory.total) * 100;
  const diskPercentage = (disk.used / disk.total) * 100;
  const bandwidthPercentage = (bandwidth.used / bandwidth.total) * 100;
  
  const createdDate = format(new Date(created_at), 'PPP');

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{label}</CardTitle>
            <CardDescription className="mt-1">ID: {id}</CardDescription>
          </div>
          <VpsStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">IP Addresses</h4>
            {ips.map((ip, index) => (
              <div key={index} className="text-sm bg-gray-100 dark:bg-gray-800 p-1 rounded">
                {ip.ip} ({ip.type})
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-1">
                <Cpu className="h-4 w-4 mr-1 text-blue-500" />
                <h4 className="text-sm font-medium">CPU</h4>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500">{cpu.cores} Cores</span>
                <span className="text-sm font-medium">{cpu.usage}%</span>
              </div>
              <Progress value={cpu.usage} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <Memory className="h-4 w-4 mr-1 text-purple-500" />
                <h4 className="text-sm font-medium">Memory</h4>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500">{formatBytes(memory.used)} / {formatBytes(memory.total)}</span>
                <span className="text-sm font-medium">{Math.round(memoryPercentage)}%</span>
              </div>
              <Progress value={memoryPercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <HardDrive className="h-4 w-4 mr-1 text-amber-500" />
                <h4 className="text-sm font-medium">Disk</h4>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500">{formatGigabytes(disk.used)} / {formatGigabytes(disk.total)}</span>
                <span className="text-sm font-medium">{Math.round(diskPercentage)}%</span>
              </div>
              <Progress value={diskPercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <Network className="h-4 w-4 mr-1 text-green-500" />
                <h4 className="text-sm font-medium">Bandwidth</h4>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500">{formatGigabytes(bandwidth.used)} / {formatGigabytes(bandwidth.total)}</span>
                <span className="text-sm font-medium">{Math.round(bandwidthPercentage)}%</span>
              </div>
              <Progress value={bandwidthPercentage} className="h-2" />
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Datacenter:</span> {datacenter}
            </div>
            <div>
              <span className="font-medium">Created:</span> {createdDate}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
