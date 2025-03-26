
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

interface IncomeReceipt {
  id: string;
  matricula: string;
  category: string;
  amount: string;
  reference_month: string;
  payment_date: string | null;
  unit: string | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
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

function formatMonthFromRefMonth(referenceMonth: string): string {
  const [year, month] = referenceMonth.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const monthIndex = parseInt(month) - 1;
  return `${monthNames[monthIndex]} de ${year}`;
}

const MinhasCobrancas = () => {
  const { user } = useApp();
  
  const residentId = user?.residentId;
  const matricula = user?.matricula;
  const unidade = user?.unidade;

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

  // Fetch condominium income receipts for the resident's unit
  const { data: incomeReceipts, isLoading: isLoadingReceipts, error: receiptsError } = useQuery({
    queryKey: ['resident-income-receipts', matricula, unidade, currentYear],
    queryFn: async () => {
      if (!matricula || !unidade) return [];

      try {
        const { data, error } = await supabase
          .from('financial_incomes')
          .select('*')
          .eq('matricula', matricula)
          .eq('unit', unidade)
          .ilike('reference_month', `${currentYear}-%`)
          .order('reference_month', { ascending: true });
          
        if (error) {
          console.error('Error fetching income receipts:', error);
          toast({
            title: "Erro ao carregar receitas",
            description: "Ocorreu um erro ao buscar as receitas do seu condomínio. Por favor, tente novamente.",
            variant: "destructive"
          });
          throw new Error('Erro ao buscar receitas');
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in fetch income receipts function:', error);
        return [];
      }
    },
    enabled: !!matricula && !!unidade
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
        
        {/* Paid Charges / Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>Cobranças Pagas</CardTitle>
            <CardDescription>
              Cobranças e pagamentos da sua unidade em {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingReceipts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                <span className="ml-2 text-lg text-muted-foreground">Carregando pagamentos...</span>
              </div>
            ) : receiptsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  Ocorreu um erro ao carregar os pagamentos. Por favor, tente novamente mais tarde.
                </AlertDescription>
              </Alert>
            ) : incomeReceipts.length === 0 ? (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Nenhum pagamento registrado</AlertTitle>
                <AlertDescription>
                  Não existem pagamentos registrados para sua unidade em {currentYear}.
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
                      <TableHead>Data de Pagamento</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeReceipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">
                          {formatMonthFromRefMonth(receipt.reference_month)}
                        </TableCell>
                        <TableCell>{receipt.unit || '-'}</TableCell>
                        <TableCell>{receipt.category}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(receipt.amount))}</TableCell>
                        <TableCell>{formatDate(receipt.payment_date)}</TableCell>
                        <TableCell>{receipt.observations || '-'}</TableCell>
                      </TableRow>
                    ))}
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
