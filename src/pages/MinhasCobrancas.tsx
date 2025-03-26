
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/currency';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Clock, XCircle, FileDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Charge {
  id: string;
  unit: string;
  month: string;
  year: string;
  amount: string;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  payment_date: string | null;
}

interface FinancialIncome {
  id: string;
  matricula: string;
  category: string;
  amount: string;
  reference_month: string;
  payment_date?: string;
  unit?: string;
  observations?: string;
}

const statusColors = {
  pending: {
    background: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: <Clock className="h-4 w-4 mr-1" />,
    label: 'Pendente'
  },
  paid: {
    background: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
    label: 'Pago'
  },
  overdue: {
    background: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: <XCircle className="h-4 w-4 mr-1" />,
    label: 'Atrasado'
  }
};

function formatMonthYear(month: string, year: string) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const monthIndex = parseInt(month) - 1;
  return `${monthNames[monthIndex]} de ${year}`;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

const MinhasCobrancas = () => {
  const { user } = useApp();
  
  const residentId = user?.residentId;
  const matricula = user?.matricula;
  const unit = user?.unit;

  // Get current year for filtering charges
  const currentYear = new Date().getFullYear().toString();
  
  const { data: charges, isLoading: isLoadingCharges, error: chargesError } = useQuery({
    queryKey: ['resident-charges', residentId, matricula, currentYear],
    queryFn: async () => {
      if (!residentId || !matricula) return [];

      try {
        const { data, error } = await supabase
          .from('resident_charges')
          .select('*')
          .eq('matricula', matricula)
          .eq('resident_id', residentId)
          .eq('year', currentYear)
          .order('month', { ascending: true });
          
        if (error) {
          console.error('Error fetching charges:', error);
          toast({
            title: "Erro ao carregar cobranças",
            description: "Ocorreu um erro ao buscar suas cobranças. Por favor, tente novamente.",
            variant: "destructive"
          });
          throw new Error('Erro ao buscar cobranças');
        }
        
        const today = new Date();
        
        // Map data to Charge type with correct status typing
        const processedCharges = (data || []).map((charge) => {
          const dueDate = new Date(charge.due_date);
          
          let chargeStatus: 'pending' | 'paid' | 'overdue' = 'pending';
          
          if (charge.status === 'paid') {
            chargeStatus = 'paid';
          } else if (charge.status === 'pending' && dueDate < today) {
            chargeStatus = 'overdue';
          } else {
            chargeStatus = 'pending';
          }
          
          return {
            ...charge,
            status: chargeStatus
          } as Charge;
        });
        
        return processedCharges;
      } catch (error) {
        console.error('Error in fetch function:', error);
        return [];
      }
    },
    enabled: !!residentId && !!matricula
  });

  // Fetch financial incomes for the resident's unit
  const { data: financialIncomes, isLoading: isLoadingIncomes, error: incomesError } = useQuery({
    queryKey: ['financial-incomes', matricula, unit, currentYear],
    queryFn: async () => {
      if (!matricula || !unit) return [];

      try {
        const { data, error } = await supabase
          .from('financial_incomes')
          .select('*')
          .eq('matricula', matricula)
          .eq('unit', unit)
          .ilike('reference_month', `%/${currentYear}`)
          .order('reference_month', { ascending: true });
          
        if (error) {
          console.error('Error fetching financial incomes:', error);
          toast({
            title: "Erro ao carregar receitas",
            description: "Ocorreu um erro ao buscar as receitas da sua unidade. Por favor, tente novamente.",
            variant: "destructive"
          });
          throw new Error('Erro ao buscar receitas');
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in fetch function:', error);
        return [];
      }
    },
    enabled: !!matricula && !!unit
  });

  // Split charges into paid and pending/overdue
  const pendingCharges = charges?.filter(charge => charge.status === 'pending' || charge.status === 'overdue') || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Cobranças</h1>
          <p className="text-muted-foreground">
            Acompanhe suas cobranças de condomínio
          </p>
        </div>
        
        {/* Pending Charges */}
        <Card>
          <CardHeader>
            <CardTitle>Cobranças Pendentes</CardTitle>
            <CardDescription>
              Cobranças de condomínio pendentes para {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCharges ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                <span className="ml-2 text-lg text-muted-foreground">Carregando cobranças...</span>
              </div>
            ) : chargesError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  Ocorreu um erro ao carregar as cobranças. Por favor, tente novamente mais tarde.
                </AlertDescription>
              </Alert>
            ) : pendingCharges.length === 0 ? (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Nenhuma cobrança pendente</AlertTitle>
                <AlertDescription>
                  Não existem cobranças pendentes para {currentYear}.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competência</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCharges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell className="font-medium">
                          {formatMonthYear(charge.month, charge.year)}
                        </TableCell>
                        <TableCell>{charge.unit}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(charge.amount))}</TableCell>
                        <TableCell>{formatDate(charge.due_date)}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`flex items-center ${statusColors[charge.status].background} ${statusColors[charge.status].text} ${statusColors[charge.status].border} border`}
                            variant="outline"
                          >
                            {statusColors[charge.status].icon}
                            {statusColors[charge.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-brand-600 hover:text-brand-800 hover:bg-brand-50"
                          >
                            <FileDown className="h-4 w-4 mr-1" />
                            Boleto
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Paid Charges (Financial Incomes for the resident's unit) */}
        <Card>
          <CardHeader>
            <CardTitle>Cobranças Pagas</CardTitle>
            <CardDescription>
              Receitas do condomínio para a unidade {unit} em {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingIncomes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                <span className="ml-2 text-lg text-muted-foreground">Carregando receitas...</span>
              </div>
            ) : incomesError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  Ocorreu um erro ao carregar as receitas. Por favor, tente novamente mais tarde.
                </AlertDescription>
              </Alert>
            ) : financialIncomes && financialIncomes.length === 0 ? (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Nenhuma receita registrada</AlertTitle>
                <AlertDescription>
                  Não existem receitas registradas para a unidade {unit} em {currentYear}.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competência</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialIncomes?.map((income) => {
                      // Extract month and year from reference_month (format: MM/YYYY)
                      const [month, year] = income.reference_month.split('/');
                      
                      return (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">
                            {month && year ? formatMonthYear(month, year) : income.reference_month}
                          </TableCell>
                          <TableCell>{income.unit || '-'}</TableCell>
                          <TableCell>{income.category}</TableCell>
                          <TableCell>{formatCurrency(parseFloat(income.amount))}</TableCell>
                          <TableCell>{formatDate(income.payment_date || null)}</TableCell>
                          <TableCell>
                            {income.observations ? (
                              <span className="line-clamp-2" title={income.observations}>
                                {income.observations}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MinhasCobrancas;
