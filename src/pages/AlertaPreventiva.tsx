
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { CalendarIcon, Plus, Check, X, AlertCircle } from 'lucide-react';
import { usePreventiveAlerts } from '@/hooks/use-preventive-alerts';
import { PreventiveAlert, PreventiveAlertCategory, alertCategoryLabels } from '@/types/preventiveAlerts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface FormValues {
  category: PreventiveAlertCategory;
  alertDate: Date;
  observations: string;
}

const AlertaPreventiva = () => {
  const { alerts, loading, addAlert, toggleAlertCompletion, deleteAlert } = usePreventiveAlerts();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<PreventiveAlert | null>(null);
  
  const form = useForm<FormValues>({
    defaultValues: {
      category: 'eletricos',
      observations: '',
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await addAlert(
        values.category,
        values.alertDate,
        values.observations
      );
      setFormOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleToggleCompletion = async (alert: PreventiveAlert) => {
    await toggleAlertCompletion(alert.id, !alert.isCompleted);
  };

  const handleDeleteClick = (alert: PreventiveAlert) => {
    setSelectedAlert(alert);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAlert) {
      await deleteAlert(selectedAlert.id);
      setDeleteDialogOpen(false);
      setSelectedAlert(null);
    }
  };

  const isPastDue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today && !form.getValues().alertDate;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerta Preventiva</h1>
            <p className="text-muted-foreground">
              Gerencie os alertas preventivos para manutenções e inspeções
            </p>
          </div>
          <Button 
            onClick={() => setFormOpen(!formOpen)} 
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Alerta
          </Button>
        </div>

        {formOpen && (
          <Card className="border-t-4 border-t-brand-600">
            <CardHeader>
              <CardTitle>Cadastrar Novo Alerta Preventivo</CardTitle>
              <CardDescription>
                Preencha os dados para criar um novo alerta de manutenção preventiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      rules={{ required: "Selecione uma categoria" }}
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
                      rules={{ required: "Selecione uma data para o alerta" }}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data do Alerta</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                  ) : (
                                    <span>Selecionar data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                locale={ptBR}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Digite observações ou detalhes sobre o alerta" 
                            className="h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-700 text-white"
                    >
                      Salvar Alerta
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p>Carregando alertas...</p>
          ) : alerts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-10 border rounded-lg border-dashed text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">Nenhum alerta encontrado</h3>
              <p className="text-muted-foreground mt-1">
                Cadastre alertas preventivos para receber notificações de manutenção
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className={cn(
                "border-l-4",
                alert.isCompleted 
                  ? "border-l-green-500"
                  : isPastDue(alert.alertDate) 
                    ? "border-l-red-500"
                    : "border-l-amber-500"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {alertCategoryLabels[alert.category]}
                    </CardTitle>
                    <Badge variant={alert.isCompleted ? "success" : isPastDue(alert.alertDate) ? "destructive" : "outline"}>
                      {alert.isCompleted 
                        ? "Concluído" 
                        : isPastDue(alert.alertDate)
                          ? "Pendente"
                          : "Agendado"
                      }
                    </Badge>
                  </div>
                  <CardDescription>
                    Data: {format(alert.alertDate, "PPP", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {alert.observations ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">{alert.observations}</p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Sem observações</p>
                  )}
                </CardContent>
                <CardFooter className="pt-2 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleCompletion(alert)}
                    className={cn(
                      alert.isCompleted && "text-green-600 border-green-200 hover:text-green-700 hover:border-green-300"
                    )}
                  >
                    {alert.isCompleted ? (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Desfazer
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Concluir
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(alert)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este alerta preventivo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AlertaPreventiva;
