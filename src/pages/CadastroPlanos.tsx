import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { SearchIcon, Save, FileText, History } from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useApp } from '@/contexts/AppContext';

// Define the plan interface
export interface Plan {
  id?: string;
  codigo: string;
  nome: string;
  descricao: string;
  valor: string;
  created_at?: string;
  updated_at?: string;
}

// Define the change log interface for plans
interface PlanChangeLog {
  id: string;
  codigo: string;
  campo: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  data_alteracao: string;
  usuario: string | null;
}

// Form schema for validation
const formSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome do plano é obrigatório'),
  descricao: z.string().optional(),
  valor: z.string().min(1, 'Valor do plano é obrigatório'),
});

type FormFields = z.infer<typeof formSchema>;

const CadastroPlanos = () => {
  const { user } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [changeLogs, setChangeLogs] = useState<PlanChangeLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  // Create form
  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      descricao: '',
      valor: '',
    },
  });

  // Handle search
  const handleSearch = async () => {
    const codigo = form.getValues('codigo');
    
    if (!codigo) {
      toast({
        title: 'Código obrigatório',
        description: 'Por favor, informe o código do plano para busca.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      // Search for plan by code
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('codigo', codigo)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: 'Plano não encontrado',
            description: `Nenhum plano encontrado com o código ${codigo}.`,
            variant: 'destructive',
          });
          // Reset form but keep the codigo for convenience
          form.reset({ codigo, nome: '', descricao: '', valor: '' });
          setIsExistingRecord(false);
        } else {
          throw error;
        }
      } else if (data) {
        // Populate form with found data
        form.reset({
          codigo: data.codigo,
          nome: data.nome,
          descricao: data.descricao || '',
          valor: data.valor,
        });
        setIsExistingRecord(true);
        fetchChangeLogs(data.codigo);
      }
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      toast({
        title: 'Erro na busca',
        description: 'Ocorreu um erro ao buscar o plano. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch change logs for a plan
  const fetchChangeLogs = async (codigo: string) => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('plan_change_logs')
        .select('*')
        .eq('codigo', codigo)
        .order('data_alteracao', { ascending: false });

      if (error) throw error;
      setChangeLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico de alterações:', error);
      toast({
        title: 'Erro no histórico',
        description: 'Não foi possível carregar o histórico de alterações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormFields) => {
    setIsSubmitting(true);
    try {
      const userEmail = user ? user.email : null;
      
      // Format value to ensure it's a valid number string
      const formattedValue = data.valor.replace(',', '.');
      
      // Check if this is an update or a new record
      if (isExistingRecord) {
        // Fetch current plan data to compare for change logs
        const { data: currentPlan } = await supabase
          .from('plans')
          .select('*')
          .eq('codigo', data.codigo)
          .single();

        // Update the plan
        const { error: updateError } = await supabase
          .from('plans')
          .update({
            nome: data.nome,
            descricao: data.descricao,
            valor: formattedValue,
            updated_at: new Date().toISOString(),
          })
          .eq('codigo', data.codigo);

        if (updateError) throw updateError;

        // Record changes for audit log
        if (currentPlan) {
          const changes = [
            { field: 'Nome do Plano', old: currentPlan.nome, new: data.nome },
            { field: 'Descrição', old: currentPlan.descricao, new: data.descricao },
            { field: 'Valor', old: currentPlan.valor, new: formattedValue },
          ];

          // Only log actual changes
          for (const change of changes) {
            if (change.old !== change.new) {
              await supabase.from('plan_change_logs').insert({
                codigo: data.codigo,
                campo: change.field,
                valor_anterior: change.old,
                valor_novo: change.new,
                usuario: userEmail,
              });
            }
          }
        }

        toast({
          title: 'Plano atualizado',
          description: 'O plano foi atualizado com sucesso!',
        });
      } else {
        // Insert new plan
        const { error: insertError } = await supabase
          .from('plans')
          .insert({
            codigo: data.codigo,
            nome: data.nome,
            descricao: data.descricao,
            valor: formattedValue,
          });

        if (insertError) throw insertError;

        toast({
          title: 'Plano cadastrado',
          description: 'O novo plano foi cadastrado com sucesso!',
        });
      }

      // Refresh logs if it's an existing record
      if (isExistingRecord) {
        fetchChangeLogs(data.codigo);
      } else {
        // Set as existing record after successful creation
        setIsExistingRecord(true);
        fetchChangeLogs(data.codigo);
      }
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar o plano. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate pagination for change logs
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = changeLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(changeLogs.length / logsPerPage);

  // Function to format date/time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Cadastro de Planos</h1>
          <p className="text-gray-600 mt-2">Gerencie os planos disponíveis para contratação</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Form Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações do Plano
              </CardTitle>
              <CardDescription>
                Preencha as informações para cadastrar ou atualizar um plano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Código do Plano*</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Ex: BASIC, PREMIUM, etc" 
                              />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleSearch}
                              disabled={isSearching}
                            >
                              {isSearching ? (
                                <>Buscando...</>
                              ) : (
                                <>
                                  <SearchIcon className="h-4 w-4 mr-2" />
                                  Buscar
                                </>
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Plano*</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Plano Básico, Plano Premium, etc" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Descreva os detalhes e benefícios do plano" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)*</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: 99.90" 
                          />
                        </FormControl>
                        <FormDescription>
                          Informe o valor mensal do plano em reais (R$)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        "Salvando..."
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {isExistingRecord ? "Atualizar Plano" : "Cadastrar Plano"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Change Logs Card */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Alterações
              </CardTitle>
              <CardDescription>
                {changeLogs.length > 0 
                  ? `Últimas alterações no plano ${form.getValues('codigo')}`
                  : 'Busque um plano para ver o histórico de alterações'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingLogs ? (
                <div className="flex justify-center items-center py-8">
                  <p>Carregando histórico...</p>
                </div>
              ) : changeLogs.length > 0 ? (
                <>
                  <ScrollArea className="h-[400px] px-6">
                    <Table>
                      <TableBody>
                        {currentLogs.map((log, i) => (
                          <React.Fragment key={log.id}>
                            <TableRow>
                              <TableCell className="py-2 px-0">
                                <div className="grid gap-1">
                                  <div className="font-medium">{log.campo}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDateTime(log.data_alteracao)} • {log.usuario || 'Sistema'}
                                  </div>
                                  <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                                    <div className="rounded-md bg-muted p-2">
                                      <div className="text-xs text-muted-foreground mb-1">Anterior:</div>
                                      <div>{log.valor_anterior || '-'}</div>
                                    </div>
                                    <div className="rounded-md bg-muted p-2">
                                      <div className="text-xs text-muted-foreground mb-1">Novo:</div>
                                      <div>{log.valor_novo || '-'}</div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                            {i < currentLogs.length - 1 && <TableRow><TableCell className="p-0"><Separator /></TableCell></TableRow>}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="py-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              aria-disabled={currentPage === 1}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                onClick={() => setCurrentPage(i + 1)}
                                isActive={currentPage === i + 1}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              aria-disabled={currentPage === totalPages}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center items-center py-8 px-6">
                  <p className="text-muted-foreground">Nenhuma alteração registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CadastroPlanos;
