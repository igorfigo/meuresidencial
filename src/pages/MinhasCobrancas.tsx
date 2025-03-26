
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/currency';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface PixSettings {
  diavencimento: string;
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

function getDueDateFromPixSettings(month: string, year: string, dayOfMonth: string): string {
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  const dayNum = parseInt(dayOfMonth);
  
  // Use a more reliable approach to create the date without timezone issues
  const date = new Date();
  date.setFullYear(yearNum);
  date.setMonth(monthNum - 1);
  date.setDate(dayNum);
  
  // Format as YYYY-MM-DD
  return format(date, 'yyyy-MM-dd');
}

const MinhasCobrancas = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<string>('pending');
  
  const residentId = user?.residentId;
  const matricula = user?.matricula;
  const unit = user?.unit;
  
  const { data: pixSettings } = useQuery({
    queryKey: ['pix-settings', matricula],
    queryFn: async () => {
      if (!matricula) return null;

      try {
        const { data, error } = await supabase
          .from('pix_receipt_settings')
          .select('diavencimento')
          .eq('matricula', matricula)
          .single();
          
        if (error) {
          console.error('Error fetching PIX settings:', error);
          return { diavencimento: '10' };
        }
        
        return data;
      } catch (err) {
        console.error('Error in PIX settings fetch:', err);
        return { diavencimento: '10' };
      }
    },
    enabled: !!matricula
  });
  
  const { data: paidCharges, isLoading: isLoadingPaid } = useQuery({
    queryKey: ['resident-paid-charges', residentId, matricula, unit],
    queryFn: async () => {
      if (!residentId || !matricula || !unit) return [];

      try {
        const { data, error } = await supabase
          .from('financial_incomes')
          .select('*')
          .eq('matricula', matricula)
          .eq('unit', unit)
          .order('payment_date', { ascending: false });
          
        if (error) {
          console.error('Error fetching paid charges:', error);
          return [];
        }
        
        return (data || []).map(income => {
          const date = income.payment_date ? new Date(income.payment_date) : new Date();
          const month = (date.getMonth() + 1).toString();
          const year = date.getFullYear().toString();
          
          return {
            id: income.id,
            unit: income.unit || unit,
            month: month,
            year: year,
            amount: income.amount,
            status: 'paid' as const,
            due_date: income.reference_month || '',
            payment_date: income.payment_date
          };
        });
      } catch (err) {
        console.error('Error in paid charge fetching function:', err);
        return [];
      }
    },
    enabled: !!residentId && !!matricula && !!unit
  });

  const { data: residentDetails } = useQuery({
    queryKey: ['resident-details', residentId],
    queryFn: async () => {
      if (!residentId) return null;

      try {
        const { data, error } = await supabase
          .from('residents')
          .select('valor_condominio')
          .eq('id', residentId)
          .single();
          
        if (error) {
          console.error('Error fetching resident details:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error('Error in resident details fetch:', err);
        return null;
      }
    },
    enabled: !!residentId
  });

  const generateCurrentYearCharges = (): Charge[] => {
    if (!unit || !residentDetails?.valor_condominio) return [];
    
    const currentYear = new Date().getFullYear().toString();
    const dueDay = pixSettings?.diavencimento || '10';
    const today = new Date();
    
    const generatedCharges: Charge[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const dueDate = getDueDateFromPixSettings(monthStr, currentYear, dueDay);
      
      const isPaid = paidCharges?.some(
        charge => charge.month === monthStr && charge.year === currentYear
      );
      
      if (!isPaid) {
        const dueDateObj = new Date(dueDate);
        const status = dueDateObj < today ? 'overdue' : 'pending';
        
        generatedCharges.push({
          id: `generated-${currentYear}-${monthStr}`,
          unit,
          month: monthStr,
          year: currentYear,
          amount: residentDetails.valor_condominio,
          status,
          due_date: dueDate,
          payment_date: null
        });
      }
    }
    
    return generatedCharges;
  };
  
  const isLoading = isLoadingPaid;
  
  const charges = [...(paidCharges || []), ...generateCurrentYearCharges()];
  
  const filteredCharges = charges?.filter(charge => {
    if (activeTab === 'pending') return charge.status === 'pending' || charge.status === 'overdue';
    if (activeTab === 'paid') return charge.status === 'paid';
    return false;
  }) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Cobranças</h1>
          <p className="text-muted-foreground">
            Acompanhe suas cobranças de condomínio
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Cobranças</CardTitle>
            <CardDescription>
              Visualize e gerencie suas cobranças de condomínio
            </CardDescription>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="paid">Pagas</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                <span className="ml-2 text-lg text-muted-foreground">Carregando cobranças...</span>
              </div>
            ) : filteredCharges.length === 0 ? (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Nenhuma cobrança encontrada</AlertTitle>
                <AlertDescription>
                  Não existem cobranças {activeTab === 'paid' ? "pagas" : "pendentes"} registradas para a sua unidade.
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
                      {activeTab === 'pending' && (
                        <TableHead>Vencimento</TableHead>
                      )}
                      {activeTab === 'paid' && (
                        <TableHead>Pagamento</TableHead>
                      )}
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCharges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell className="font-medium">
                          {charge.status === 'paid' 
                            ? charge.due_date
                            : formatMonthYear(charge.month, charge.year)
                          }
                        </TableCell>
                        <TableCell>{charge.unit}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(charge.amount))}</TableCell>
                        {activeTab === 'pending' && (
                          <TableCell>{formatDate(charge.due_date)}</TableCell>
                        )}
                        {activeTab === 'paid' && (
                          <TableCell>{formatDate(charge.payment_date)}</TableCell>
                        )}
                        <TableCell>
                          <Badge 
                            className={`flex items-center ${statusColors[charge.status].background} ${statusColors[charge.status].text} ${statusColors[charge.status].border} border`}
                            variant="outline"
                          >
                            {statusColors[charge.status].icon}
                            {statusColors[charge.status].label}
                          </Badge>
                        </TableCell>
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
