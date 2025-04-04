
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePreventiveAlerts } from '@/hooks/use-preventive-alerts';
import { PreventiveAlertCategory, alertCategoryLabels } from '@/types/preventiveAlerts';
import { AlertCircle, Calendar, Check, CheckCircle2, CircleAlert, Clock, Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const AlertaPreventiva = () => {
  const { 
    alerts, 
    loading, 
    pendingAlerts,
    addAlert, 
    toggleAlertCompletion, 
    deleteAlert 
  } = usePreventiveAlerts();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [editAlertId, setEditAlertId] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      category: '' as PreventiveAlertCategory,
      alertDate: new Date(),
      observations: '',
    },
  });

  const onSubmit = async (values: {
    category: PreventiveAlertCategory;
    alertDate: Date;
    observations: string;
  }) => {
    const result = await addAlert(
      values.category,
      values.alertDate,
      values.observations
    );
    
    if (result) {
      form.reset();
      setOpenDialog(false);
    }
  };

  const handleToggleCompletion = async (id: string, currentState: boolean) => {
    await toggleAlertCompletion(id, !currentState);
  };

  const handleDeleteAlert = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este alerta?')) {
      await deleteAlert(id);
    }
  };

  // Filter alerts based on active tab
  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return !alert.isCompleted;
    if (activeTab === 'completed') return alert.isCompleted;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Alerta Preventiva</h1>
            <p className="text-muted-foreground">Gerencie alertas de manutenção preventiva</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                <span>Novo Alerta</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Alerta Preventivo</DialogTitle>
                <DialogDescription>
                  Adicione um novo alerta para manutenção preventiva no condomínio.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(alertCategoryLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="alertDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data do Alerta</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva detalhes sobre esta manutenção preventiva" 
                            {...field} 
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar Alerta</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {pendingAlerts > 0 && (
          <Card className="mb-6 border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">
                    Você possui {pendingAlerts} alerta{pendingAlerts > 1 ? 's' : ''} pendente{pendingAlerts > 1 ? 's' : ''} 
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Verifique as manutenções preventivas que precisam ser realizadas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Clock size={16} />
                <span>Todos</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <CircleAlert size={16} />
                <span>Pendentes</span>
                {pendingAlerts > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {pendingAlerts}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Concluídos</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="space-y-4">
            {renderAlertsList(filteredAlerts, loading, handleToggleCompletion, handleDeleteAlert)}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {renderAlertsList(filteredAlerts, loading, handleToggleCompletion, handleDeleteAlert)}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {renderAlertsList(filteredAlerts, loading, handleToggleCompletion, handleDeleteAlert)}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const renderAlertsList = (
  alerts: any[], 
  loading: boolean, 
  handleToggleCompletion: (id: string, currentState: boolean) => void, 
  handleDeleteAlert: (id: string) => void
) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="font-medium text-lg">Nenhum alerta encontrado</h3>
          <p className="text-muted-foreground">
            Crie novos alertas preventivos para acompanhar manutenções necessárias.
          </p>
        </CardContent>
      </Card>
    );
  }

  return alerts.map(alert => {
    const isOverdue = !alert.isCompleted && new Date(alert.alertDate) < new Date();
    const isPendingToday = !alert.isCompleted && 
      new Date(alert.alertDate).toDateString() === new Date().toDateString();
    
    return (
      <Card 
        key={alert.id} 
        className={cn(
          "transition-all hover:shadow-md",
          alert.isCompleted ? "border-l-4 border-l-green-500" : 
          isOverdue ? "border-l-4 border-l-red-500" : 
          isPendingToday ? "border-l-4 border-l-amber-500" : ""
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-medium">
                {alertCategoryLabels[alert.category as PreventiveAlertCategory]}
              </CardTitle>
              <CardDescription>
                Data do Alerta: {format(new Date(alert.alertDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={alert.isCompleted ? "outline" : "default"}
                size="sm"
                onClick={() => handleToggleCompletion(alert.id, alert.isCompleted)}
              >
                {alert.isCompleted ? (
                  <>
                    <CircleAlert size={16} className="mr-1" />
                    <span>Reabrir</span>
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-1" />
                    <span>Concluir</span>
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDeleteAlert(alert.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-line">{alert.observations}</p>
        </CardContent>
        <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground">
          {alert.isCompleted ? (
            <div className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-green-500" />
              <span>Concluído em {format(new Date(alert.updatedAt), "d MMM yyyy", { locale: ptBR })}</span>
            </div>
          ) : isOverdue ? (
            <div className="flex items-center gap-1">
              <AlertCircle size={14} className="text-red-500" />
              <span>Atrasado por {Math.ceil((new Date().getTime() - new Date(alert.alertDate).getTime()) / (1000 * 60 * 60 * 24))} dias</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Em {Math.ceil((new Date(alert.alertDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias</span>
            </div>
          )}
        </CardFooter>
      </Card>
    );
  });
};

export default AlertaPreventiva;
