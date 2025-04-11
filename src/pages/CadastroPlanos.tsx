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
import { Save, Package, Eye, History, Trash, FileEdit } from 'lucide-react';
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
  max_moradores: number;
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
      valor: '',
      max_moradores: 50
    }
  });

  const { reset, handleSubmit, setValue, getValues, register } = form;

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
    
    if (oldPlan.max_moradores !== newPlan.max_moradores) {
      changes.push({
        codigo: oldPlan.codigo,
        campo: 'Máximo de Moradores',
        valor_anterior: oldPlan.max_moradores?.toString() || '50',
        valor_novo: newPlan.max_moradores?.toString() || '50',
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
          max_moradores: formattedData.max_moradores,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'codigo'
        });

      if (error) throw error;
      
      if (isExistingRecord && oldPlan) {
        await registerChangeLog(oldPlan, {
          ...data,
          codigo: data.codigo.toUpperCase(),
          valor: data.valor,
          max_moradores: data.max_moradores
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
            valor: '',
            max_moradores: 50
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
      valor: planValue,
      max_moradores: plan.max_moradores || 50
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
      <div className="animate-fade-in space-y-6">
        <header className="mb-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 mr-2 text-brand-600" />
            <h1 className="text-3xl font-bold">Cadastro Planos</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Cadastre e gerencie os planos disponíveis para os condomínios.
          </p>
          <Separator className="mt-4" />
        </header>

        <div className="flex flex-col gap-6">
          <Card className="p-4 border-t-4 border-t-brand-600 shadow-md">
            <h2 className="text-xl font-semibold mb-3">Planos Cadastrados</h2>
            <ScrollArea className="h-64 rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-center">Nome</TableHead>
                    <TableHead className="text-center">Valor</TableHead>
                    <TableHead className="text-center">Máx. Moradores</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Nenhum plano cadastrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan.codigo}>
                        <TableCell className="font-medium">{plan.codigo}</TableCell>
                        <TableCell className="text-center">{plan.nome}</TableCell>
                        <TableCell className="text-center">{formatCurrency(plan.valor)}</TableCell>
                        <TableCell className="text-center">{plan.max_moradores || 50}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditPlan(plan)}
                              className="h-7 w-7"
                              title="Editar"
                            >
                              <FileEdit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewLogs(plan.codigo)}
                              className="h-7 w-7"
                              title="Histórico"
                            >
                              <Eye className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleDeletePlan(plan.codigo)}
                              className="h-7 w-7"
                              title="Excluir"
                            >
                              <Trash className="h-4 w-4 text-red-500" />
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
          
          <Card className="p-4 border-t-4 border-t-brand-600 shadow-md">
            <h2 className="text-xl font-semibold mb-3">{isExistingRecord ? 'Editar Plano' : 'Novo Plano'}</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo" required>Código</Label>
                  <Input
                    id="codigo"
                    placeholder="Código (Ex: BASIC, PREMIUM)"
                    {...form.register('codigo', { required: true })}
                    readOnly={isExistingRecord}
                    className={isExistingRecord ? 'bg-gray-100' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nome" required>Nome do Plano</Label>
                  <Input
                    id="nome"
                    placeholder="Nome do plano"
                    {...form.register('nome', { required: true })}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descrição do plano"
                    {...form.register('descricao')}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor" required>Valor (R$)</Label>
                  <Input
                    id="valor"
                    placeholder="000,00"
                    {...form.register('valor', { required: true })}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Digite apenas os números no formato 0,00</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_moradores" required>Máximo de Moradores</Label>
                  <Input
                    id="max_moradores"
                    type="number"
                    min="1"
                    placeholder="50"
                    {...form.register('max_moradores', { 
                      required: true,
                      valueAsNumber: true,
                      min: 1
                    })}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto bg-brand-600 hover:bg-brand-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Salvando...' : (isExistingRecord ? 'Atualizar Plano' : 'Salvar Plano')}
              </Button>
            </form>
          </Card>
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
