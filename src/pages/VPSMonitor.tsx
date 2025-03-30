
import React, { useState } from 'react';
import { format } from 'date-fns';
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  ArrowDownUp, 
  Clock, 
  CpuIcon, 
  DatabaseIcon,
  HardDrive, 
  PlayCircle, 
  Power, 
  RefreshCw, 
  Server, 
  StopCircle 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const VPSMonitor: React.FC = () => {
  const { 
    servers,
    isLoadingServers,
    serverDetails,
    selectedServerId,
    setSelectedServerId,
    timeRange,
    setTimeRange,
    getMetricsData,
    restartServer,
    stopServer,
    startServer
  } = useVPSMonitor();

  const formatDateOutput = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (e) {
      return dateString;
    }
  };

  const handleServerAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!selectedServerId) return;
    
    switch (action) {
      case 'start':
        await startServer(selectedServerId);
        break;
      case 'stop':
        await stopServer(selectedServerId);
        break;
      case 'restart':
        await restartServer(selectedServerId);
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'restarting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500">Running</Badge>;
      case 'stopped':
        return <Badge className="bg-gray-500">Stopped</Badge>;
      case 'restarting':
        return <Badge className="bg-yellow-500">Restarting</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDataForCharts = (data: any[]) => {
    return data.map(item => ({
      ...item,
      time: format(new Date(item.time), 'HH:mm')
    }));
  };

  const renderServersList = () => {
    if (isLoadingServers) {
      return Array(1).fill(0).map((_, i) => (
        <Card key={i} className="mb-4">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      ));
    }

    if (!servers.length) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Servers Found</AlertTitle>
          <AlertDescription>
            No VPS servers were found in your account.
          </AlertDescription>
        </Alert>
      );
    }

    return servers.map(server => (
      <Card 
        key={server.id} 
        className={`mb-4 cursor-pointer hover:border-primary transition-colors ${selectedServerId === server.id ? 'border-primary' : ''}`}
        onClick={() => setSelectedServerId(server.id)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Server className="h-4 w-4 mr-2" />
            {server.name}
          </CardTitle>
          <CardDescription>{server.ip}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(server.status)}`}></div>
              <span className="text-sm text-muted-foreground">{server.status.charAt(0).toUpperCase() + server.status.slice(1)}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">OS: {server.os}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  const renderServerDetails = () => {
    if (!selectedServerId) {
      return (
        <Card>
          <CardContent className="pt-6 text-center">
            <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Select a server from the list to view details</p>
          </CardContent>
        </Card>
      );
    }

    if (!serverDetails) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Server Overview */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>{serverDetails.name}</CardTitle>
              {getStatusBadge(serverDetails.status)}
            </div>
            <CardDescription>
              IP: {serverDetails.ip} • Location: {serverDetails.location}
            </CardDescription>
            <CardDescription>
              Hostname: {serverDetails.hostname}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center">
                    <CpuIcon className="h-4 w-4 mr-1" /> CPU Usage
                  </span>
                  <span className="text-sm">{serverDetails.cpu.utilization}%</span>
                </div>
                <Progress value={serverDetails.cpu.utilization} className="h-2" />
                <p className="text-xs text-muted-foreground">{serverDetails.cpu.cores} cores</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center">
                    <DatabaseIcon className="h-4 w-4 mr-1" /> Memory Usage
                  </span>
                  <span className="text-sm">{serverDetails.memory.utilization}%</span>
                </div>
                <Progress value={serverDetails.memory.utilization} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {serverDetails.memory.used.toFixed(1)} GB / {serverDetails.memory.total} GB
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center">
                    <HardDrive className="h-4 w-4 mr-1" /> Disk Usage
                  </span>
                  <span className="text-sm">{serverDetails.disk.utilization}%</span>
                </div>
                <Progress value={serverDetails.disk.utilization} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {serverDetails.disk.used} GB / {serverDetails.disk.total} GB
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <ArrowDownUp className="h-4 w-4 mr-1" /> Network Traffic
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-sm text-muted-foreground">Incoming</p>
                  <p className="text-lg font-medium">{serverDetails.network.incoming} Mbps</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-sm text-muted-foreground">Outgoing</p>
                  <p className="text-lg font-medium">{serverDetails.network.outgoing} Mbps</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-2 justify-end">
              {serverDetails.status === 'running' ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleServerAction('restart')}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleServerAction('stop')}
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleServerAction('start')}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}
              <Button variant="outline" size="icon">
                <Power className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Performance Metrics</h3>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-[120px]">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CPU Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formatDataForCharts(getMetricsData(selectedServerId, 'cpu'))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value}%`, 'CPU']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="CPU Usage" 
                      stroke="#3b82f6" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formatDataForCharts(getMetricsData(selectedServerId, 'memory'))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Memory']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Memory Usage" 
                      stroke="#8b5cf6" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Disk Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatDataForCharts(getMetricsData(selectedServerId, 'disk'))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis unit="%" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Disk']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Disk Usage" 
                        stroke="#10b981" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Network Traffic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatDataForCharts(getMetricsData(selectedServerId, 'network'))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis unit=" Mbps" />
                      <Tooltip formatter={(value) => [`${value} Mbps`, 'Traffic']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Network Traffic" 
                        stroke="#f59e0b" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Server Information */}
        <Card>
          <CardHeader>
            <CardTitle>Server Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Name</TableCell>
                  <TableCell>{serverDetails.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ID</TableCell>
                  <TableCell>{serverDetails.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Status</TableCell>
                  <TableCell>{getStatusBadge(serverDetails.status)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">IP Address</TableCell>
                  <TableCell>{serverDetails.ip}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Operating System</TableCell>
                  <TableCell>{serverDetails.os}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CPU</TableCell>
                  <TableCell>{serverDetails.cpu.cores} cores</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Memory</TableCell>
                  <TableCell>{serverDetails.memory.total} GB</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Disk</TableCell>
                  <TableCell>{serverDetails.disk.total} GB</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Location</TableCell>
                  <TableCell>{serverDetails.location}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Created</TableCell>
                  <TableCell>{formatDateOutput(serverDetails.created_at)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Hostname</TableCell>
                  <TableCell>{serverDetails.hostname}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VPS Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your Hostinger virtual private server.
          </p>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Your Server</h2>
            {renderServersList()}
          </div>
          
          <div className="md:col-span-2 lg:col-span-3">
            {renderServerDetails()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VPSMonitor;
