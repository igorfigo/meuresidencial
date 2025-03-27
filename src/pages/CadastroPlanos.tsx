
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Save, Package, Search, History, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Plan } from '@/hooks/use-plans';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatToBRL, BRLToNumber, formatCurrencyInput } from '@/utils/currency';

type FormFields = {
  codigo: string;
  nome: string;
  descricao: string;
  valor: string;
};

interface PlanChangeLog {
  id: string;
  codigo: string;
  campo: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  data_alteracao: string;
  usuario: string | null;
}

export const CadastroPlanos = () => {
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changeLogs, setChangeLogs] = useState<PlanChangeLog[]>([]);
  const [filteredChangeLogs, setFilteredChangeLogs] = useState<PlanChangeLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanForLogs, setSelectedPlanForLogs] = useState<string | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

  const form = useForm<FormFields>({
    defaultValues: {
      codigo: '',
      nome: '',
      descricao: '',
      valor: ''
    }
  });

  const { reset, handleSubmit, setValue, getValues } = form;

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      
      const formattedData = data?.map(plan => ({
        ...plan,
        valor: `R$ ${formatToBRL(Number(plan.valor))}`
      })) || [];
      
      setPlans(formattedData);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast.error('Erro ao carregar a lista de planos.');
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const loadChangeLogs = async (codigo: string) => {
    if (!codigo) return;
    
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
      console.error('Erro ao carregar histórico de alterações:', error);
      toast.error('Erro ao carregar histórico de alterações.');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (changeLogs.length > 0) {
      const validChanges = changeLogs.filter(log => {
        if (log.valor_anterior === null && log.valor_novo === null) return false;
        if (log.valor_anterior === log.valor_novo) return false;
        return true;
      });
      
      setFilteredChangeLogs(validChanges);
      setTotalPages(Math.max(1, Math.ceil(validChanges.length / ITEMS_PER_PAGE)));
      setCurrentPage(1);
    } else {
      setFilteredChangeLogs([]);
      setTotalPages(1);
    }
  }, [changeLogs]);

  const registerChangeLog = async (oldPlan: Plan | null, newPlan: Plan) => {
    if (!oldPlan) return;
    
    const changes = [];
    
    if (oldPlan.nome !== newPlan.nome) {
      changes.push({
        codigo: oldPlan.codigo,
        campo: 'Nome do Plano',
        valor_anterior: oldPlan.nome,
        valor_novo: newPlan.nome,
        usuario: user?.email || null
      });
    }
    
    if (oldPlan.descricao !== newPlan.descricao) {
      changes.push({
        codigo: oldPlan.codigo,
        campo: 'Descrição',
        valor_anterior: oldPlan.descricao,
        valor_novo: newPlan.descricao,
        usuario: user?.email || null
      });
    }
    
    if (oldPlan.valor !== newPlan.valor) {
      changes.push({
        codigo: oldPlan.codigo,
        campo: 'Valor',
        valor_anterior: oldPlan.valor,
        valor_novo: newPlan.valor,
        usuario: user?.email || null
      });
    }
    
    for (const change of changes) {
      await supabase
        .from('plan_change_logs')
        .insert(change);
    }
  };

  const onSubmit = async (data: FormFields) => {
    const valorPattern = /^\d{1,3}(\.\d{3})*,\d{2}$/;
    if (!valorPattern.test(data.valor)) {
      toast.error('O valor do plano deve seguir o formato 0.000,00');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        codigo: data.codigo.toUpperCase(),
        valor: BRLToNumber(data.valor).toString()
      };
      
      let oldPlan = null;
      if (isExistingRecord) {
        const { data: existingPlan } = await supabase
          .from('plans')
          .select('*')
          .eq('codigo', formattedData.codigo)
          .single();
        
        oldPlan = existingPlan ? {
          ...existingPlan,
          valor: formatToBRL(Number(existingPlan.valor))
        } : null;
      }
      
      const { error } = await supabase
        .from('plans')
        .upsert({
          codigo: formattedData.codigo,
          nome: formattedData.nome,
          descricao: formattedData.descricao,
          valor: formattedData.valor,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'codigo'
        });

      if (error) throw error;
      
      if (isExistingRecord && oldPlan) {
        await registerChangeLog(oldPlan, {
          ...data,
          codigo: data.codigo.toUpperCase(),
          valor: data.valor
        });
      }
      
      toast.success(isExistingRecord ? 'Plano atualizado com sucesso!' : 'Plano cadastrado com sucesso!');
      
      if (!isExistingRecord) {
        reset();
      }
      
      fetchPlans();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar plano. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (codigo: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o plano ${codigo}?`)) {
      try {
        const { error } = await supabase
          .from('plans')
          .delete()
          .eq('codigo', codigo);
        
        if (error) throw error;
        
        toast.success('Plano excluído com sucesso!');
        fetchPlans();
        
        if (form.getValues().codigo === codigo) {
          reset({
            codigo: '',
            nome: '',
            descricao: '',
            valor: ''
          });
          setIsExistingRecord(false);
          setChangeLogs([]);
        }
      } catch (error) {
        console.error('Erro ao excluir plano:', error);
        toast.error('Erro ao excluir plano. Verifique se não existem condomínios utilizando este plano.');
      }
    }
  };

  const handleEditPlan = async (plan: Plan) => {
    let planValue = plan.valor;
    if (planValue.startsWith('R$')) {
      planValue = formatToBRL(BRLToNumber(planValue));
    }

    reset({
      codigo: plan.codigo,
      nome: plan.nome,
      descricao: plan.descricao || '',
      valor: planValue
    });
    setIsExistingRecord(true);
  };

  const handleViewLogs = async (codigo: string) => {
    setSelectedPlanForLogs(codigo);
    await loadChangeLogs(codigo);
    setIsLogDialogOpen(true);
  };

  const formatCurrency = (value: string) => {
    if (!value) return 'R$ 0,00';
    
    if (value.startsWith('R$')) {
      const numericValue = BRLToNumber(value);
      return `R$ ${formatToBRL(numericValue)}`;
    }
    
    return `R$ ${formatToBRL(Number(value))}`;
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  };

  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredChangeLogs.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);
      
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'valor') {
      const numericValue = value.replace(/\D/g, '');
      const formattedValue = formatCurrencyInput(numericValue);
      setValue(name as keyof FormFields, formattedValue);
    } else {
      setValue(name as keyof FormFields, value);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center">
            <Package className="h-6 w-6 mr-2 text-brand-600" />
            <h1 className="text-3xl font-bold">Cadastro Planos</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Cadastre e gerencie os planos disponíveis para os condomínios.
          </p>
          <Separator className="mt-4" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-6 border-t-4 border-t-brand-600 shadow-md">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">{isExistingRecord ? 'Editar Plano' : 'Novo Plano'}</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    placeholder="Código (Ex: BASIC, PREMIUM)"
                    {...form.register('codigo', { required: true })}
                    readOnly={isExistingRecord}
                    className={isExistingRecord ? 'bg-gray-100' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Plano</Label>
                  <Input
                    id="nome"
                    placeholder="Nome do plano"
                    {...form.register('nome', { required: true })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descrição do plano"
                    {...form.register('descricao')}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    placeholder="000,00"
                    {...form.register('valor', { required: true })}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Digite apenas os números no formato 0,00</p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-600 hover:bg-brand-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Salvando...' : (isExistingRecord ? 'Atualizar Plano' : 'Salvar Plano')}
                </Button>
              </form>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="p-6 border-t-4 border-t-brand-600 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Planos Cadastrados</h2>
              <ScrollArea className="h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Nenhum plano cadastrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      plans.map((plan) => (
                        <TableRow key={plan.codigo}>
                          <TableCell className="font-medium">{plan.codigo}</TableCell>
                          <TableCell>{plan.nome}</TableCell>
                          <TableCell>{formatCurrency(plan.valor)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditPlan(plan)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewLogs(plan.codigo)}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDeletePlan(plan.codigo)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </div>
        </div>
        
        <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <History className="h-5 w-5 mr-2 text-brand-600" />
                Histórico de Alterações - {selectedPlanForLogs}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto">
              {isLoadingLogs ? (
                <div className="py-8 text-center">Carregando histórico...</div>
              ) : filteredChangeLogs.length === 0 ? (
                <div className="py-8 text-center">Nenhuma alteração registrada para este plano.</div>
              ) : (
                <>
                  <ScrollArea className="h-[50vh] rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data e Hora</TableHead>
                          <TableHead>Campo</TableHead>
                          <TableHead>Valor Anterior</TableHead>
                          <TableHead>Novo Valor</TableHead>
                          <TableHead>Usuário</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCurrentItems().map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{formatDate(log.data_alteracao)}</TableCell>
                            <TableCell className="font-medium">{log.campo}</TableCell>
                            <TableCell>{log.valor_anterior || '-'}</TableCell>
                            <TableCell>{log.valor_novo || '-'}</TableCell>
                            <TableCell>{log.usuario || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  
                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage - 1);
                                }} 
                              />
                            </PaginationItem>
                          )}
                          
                          {getPageNumbers().map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink 
                                href="#" 
                                isActive={page === currentPage}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage + 1);
                                }} 
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CadastroPlanos;
