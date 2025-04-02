
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useVps } from '@/hooks/use-vps';
import { VpsDetailsCard } from '@/components/vps/VpsDetailsCard';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Server, RefreshCw, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const VpsDashboard: React.FC = () => {
  const { virtualMachines, isLoading, error, refreshData } = useVps();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    refreshData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Group virtual machines by status
  const runningVms = virtualMachines.filter(vm => vm.status.toLowerCase() === 'running');
  const stoppedVms = virtualMachines.filter(vm => vm.status.toLowerCase() === 'stopped');
  const allVms = virtualMachines;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Server className="mr-2 h-8 w-8 text-blue-500" />
              VPS Management
            </h1>
            <p className="text-muted-foreground max-w-4xl">
              Monitor and manage your virtual private servers. View status, resource usage, and server details.
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Separator className="my-6" />

        {error && (
          <Card className="border-red-300 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-400">
                  Error loading VPS data: {error.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total VPS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : virtualMachines.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : runningVms.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stopped</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stoppedVms.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({allVms.length})</TabsTrigger>
            <TabsTrigger value="running">Running ({runningVms.length})</TabsTrigger>
            <TabsTrigger value="stopped">Stopped ({stoppedVms.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-1/3 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allVms.length > 0 ? (
                  allVms.map((vm) => (
                    <VpsDetailsCard key={vm.id} {...vm} />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2">No virtual machines found.</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="running" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/3 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {runningVms.length > 0 ? (
                  runningVms.map((vm) => (
                    <VpsDetailsCard key={vm.id} {...vm} />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2">No running virtual machines found.</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stopped" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/3 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stoppedVms.length > 0 ? (
                  stoppedVms.map((vm) => (
                    <VpsDetailsCard key={vm.id} {...vm} />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2">No stopped virtual machines found.</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default VpsDashboard;
