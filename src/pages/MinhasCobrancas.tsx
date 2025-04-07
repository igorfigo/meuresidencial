import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, BRLToNumber } from '@/utils/currency';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Clock, XCircle, CreditCard, Wallet } from 'lucide-react';
import { PixDialog } from '@/components/pix/PixDialog';
import { Button } from '@/components/ui/button';
import { useOverdueCharges } from '@/hooks/use-overdue-charges';
import { useIsMobile } from '@/hooks/use-mobile';
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
  reference_month?: string;
}

interface PixSettings {
  diavencimento: string;
  tipochave: string;
  chavepix: string;
  jurosaodia: string;
}

interface Condominium {
  nomecondominio: string;
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

function extractMonthYearFromReferenceMonth(referenceMonth: string | undefined): { month: string, year: string } {
  if (!referenceMonth) {
    return { month: '01', year: new Date().getFullYear().toString() };
  }
  
  const parts = referenceMonth.split('-');
  if (parts.length >= 2) {
    return { 
      year: parts[0], 
      month: parts[1].padStart(2, '0')
    };
  }
  
  const currentDate = new Date();
  return {
    month: (currentDate.getMonth() + 1).toString().padStart(2, '0'),
    year: currentDate.getFullYear().toString()
  };
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  
  const isoDate = dateString.includes('T') 
    ? dateString 
    : `${dateString}T12:00:00`;
    
  const date = new Date(isoDate);
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

function getDueDateFromPixSettings(month: string, year: string, dayOfMonth: string): string {
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  const dayNum = parseInt(dayOfMonth);
  
  return `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
}

const MinhasCobrancas = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [isPixDialogOpen, setIsPixDialogOpen] = useState(false);
  const { overdueCount } = useOverdueCharges();
  const isMobile = useIsMobile();
  
  const residentId = user?.residentId;
  const matricula = user?.matricula;
  const unit = user?.unit;
  
  const { data: residentCreationDate } = useQuery({
    queryKey: ['resident-creation-date', residentId],
    queryFn: async () => {
      if (!residentId) return null;

      try {
        const { data, error } = await supabase
          .from('residents')
          .select('created_at')
          .eq('id', residentId)
          .single();
          
        if (error) {
          console.error('Error fetching resident creation date:', error);
          return null;
        }
        
        return data?.created_at ? new Date(data.created_at) : null;
      } catch (err) {
        console.error('Error in resident creation date fetch:', err);
        return null;
      }
    },
    enabled: !!residentId
  });
  
  const { data: pixSettings } = useQuery({
    queryKey: ['pix-settings', matricula],
    queryFn: async () => {
      if (!matricula) return null;

      try {
        const { data, error } = await supabase
          .from('pix_receipt_settings')
          .select('diavencimento, tipochave, chavepix, jurosaodia')
          .eq('matricula', matricula)
          .single();
          
        if (error) {
          console.error('Error fetching PIX settings:', error);
          return { diavencimento: '10', tipochave: 'CPF', chavepix: '', jurosaodia: '0.033' };
        }
        
        return data;
      } catch (err) {
        console.error('Error in PIX settings fetch:', err);
        return { diavencimento: '10', tipochave: 'CPF', chavepix: '', jurosaodia: '0.033' };
      }
    },
    enabled: !!matricula
  });
  
  const { data: condominiumData } = useQuery({
    queryKey: ['condominium-data', matricula],
    queryFn: async () => {
      if (!matricula) return null;

      try {
        const { data, error } = await supabase
          .from('condominiums')
          .select('nomecondominio')
          .eq('matricula', matricula)
          .single();
          
        if (error) {
          console.error('Error fetching condominium data:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error('Error in condominium data fetch:', err);
        return null;
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
          const { month, year } = extractMonthYearFromReferenceMonth(income.reference_month);
          
          return {
            id: income.id,
            unit: income.unit || unit,
            month: month,
            year: year,
            amount: income.amount,
            status: 'paid' as const,
            due_date: income.reference_month || '',
            payment_date: income.payment_date,
            reference_month: income.reference_month
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
    
    const formattedAmount = residentDetails.valor_condominio;
    const numericAmount = BRLToNumber(formattedAmount);
    const amountToUse = numericAmount > 0 ? formattedAmount : "0,00";
    
    const paidChargesMap = new Map<string, boolean>();
    paidCharges?.forEach(charge => {
      const key = `${charge.year}-${charge.month.padStart(2, '0')}`;
      paidChargesMap.set(key, true);
    });
    
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const dueDate = getDueDateFromPixSettings(monthStr, currentYear, dueDay);
      
      const chargeKey = `${currentYear}-${monthStr}`;
      const isPaid = paidChargesMap.has(chargeKey);
      
      if (!isPaid) {
        const dueDateObj = new Date(dueDate);
        const status = dueDateObj < today ? 'overdue' : 'pending';
        
        generatedCharges.push({
          id: `generated-${currentYear}-${monthStr}`,
          unit,
          month: monthStr,
          year: currentYear,
          amount: amountToUse,
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
    if (activeTab === 'paid') return charge.status === 'paid';
    
    if (activeTab === 'pending') {
      if (residentCreationDate && charge.due_date) {
        const chargeDate = new Date(charge.due_date);
        
        if (chargeDate < residentCreationDate) {
          return false;
        }
      }
      
      return charge.status === 'pending' || charge.status === 'overdue';
    }
    
    return false;
  }) || [];

  const sortedCharges = [...filteredCharges].sort((a, b) => {
    if (activeTab === 'paid') {
      const aDate = a.reference_month ? a.reference_month : `${a.year}-${a.month}`;
      const bDate = b.reference_month ? b.reference_month : `${b.year}-${b.month}`;
      return aDate.localeCompare(bDate);
    }
    return 0;
  });

  const handleOpenPixDialog = (charge: Charge) => {
    setSelectedCharge(charge);
    setIsPixDialogOpen(true);
  };

  const handleClosePixDialog = () => {
    setIsPixDialogOpen(false);
    setSelectedCharge(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 px-2 sm:px-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-brand-600 flex-shrink-0" />
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Cobranças</h1>
          </div>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {overdueCount} em atraso
            </Badge>
          )}
        </div>
        
        <div className="border-t pt-3"></div>
        
        <Card className="border-t-4 border-t-brand-600 shadow-sm">
          <CardHeader className={isMobile ? "px-3 py-3" : "px-6 py-4"}>
            <div className="flex flex-col gap-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="paid">Pagas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 py-3 pt-0" : "px-6"}>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                <span className="ml-2 text-muted-foreground">Carregando...</span>
              </div>
            ) : sortedCharges.length === 0 ? (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Nenhuma cobrança {activeTab === 'paid' ? "paga" : "pendente"}</AlertTitle>
                <AlertDescription>
                  Não existem cobranças {activeTab === 'paid' ? "pagas" : "pendentes"} para sua unidade.
                </AlertDescription>
              </Alert>
            ) : (
              isMobile ? (
                <div className="space-y-3 pb-1">
                  {sortedCharges.map((charge) => (
                    <Card key={charge.id} className="border shadow-sm">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">
                            {formatMonthYear(charge.month, charge.year)}
                          </div>
                          <Badge 
                            className={`flex items-center ${statusColors[charge.status].background} ${statusColors[charge.status].text} ${statusColors[charge.status].border} border`}
                            variant="outline"
                          >
                            {statusColors[charge.status].icon}
                            <span className="text-xs">{statusColors[charge.status].label}</span>
                          </Badge>
                        </div>
                        
                        <div className="text-sm grid grid-cols-2 gap-x-2 gap-y-1">
                          <span className="text-gray-500">Unidade:</span>
                          <span className="text-right">{charge.unit}</span>
                          
                          <span className="text-gray-500">Valor:</span>
                          <span className="text-right font-medium">
                            {formatCurrency(BRLToNumber(charge.amount))}
                          </span>
                          
                          {activeTab === 'pending' && (
                            <>
                              <span className="text-gray-500">Vencimento:</span>
                              <span className="text-right">{formatDate(charge.due_date)}</span>
                            </>
                          )}
                          
                          {activeTab === 'paid' && (
                            <>
                              <span className="text-gray-500">Pagamento:</span>
                              <span className="text-right">{formatDate(charge.payment_date)}</span>
                            </>
                          )}
                        </div>
                        
                        {activeTab === 'pending' && (
                          <div className="pt-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenPixDialog(charge)}
                              className="w-full h-8 gap-1 text-brand-600 border-brand-600"
                              disabled={!pixSettings?.chavepix}
                            >
                              <CreditCard className="h-4 w-4" />
                              <span>Pagar com PIX</span>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Competência</TableHead>
                        <TableHead className="text-center">Unidade</TableHead>
                        <TableHead className="text-center">Valor</TableHead>
                        {activeTab === 'pending' && (
                          <TableHead className="text-center">Vencimento</TableHead>
                        )}
                        {activeTab === 'paid' && (
                          <TableHead className="text-center">Pagamento</TableHead>
                        )}
                        <TableHead className="text-center">Status</TableHead>
                        {activeTab === 'pending' && (
                          <TableHead className="text-center">Ações</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedCharges.map((charge) => (
                        <TableRow key={charge.id}>
                          <TableCell className="font-medium text-left">
                            {formatMonthYear(charge.month, charge.year)}
                          </TableCell>
                          <TableCell className="text-center">{charge.unit}</TableCell>
                          <TableCell className="text-center">
                            {formatCurrency(BRLToNumber(charge.amount))}
                          </TableCell>
                          {activeTab === 'pending' && (
                            <TableCell className="text-center">{formatDate(charge.due_date)}</TableCell>
                          )}
                          {activeTab === 'paid' && (
                            <TableCell className="text-center">{formatDate(charge.payment_date)}</TableCell>
                          )}
                          <TableCell className="text-center">
                            <Badge 
                              className={`flex items-center justify-center mx-auto ${statusColors[charge.status].background} ${statusColors[charge.status].text} ${statusColors[charge.status].border} border`}
                              variant="outline"
                            >
                              {statusColors[charge.status].icon}
                              {statusColors[charge.status].label}
                            </Badge>
                          </TableCell>
                          {activeTab === 'pending' && (
                            <TableCell className="text-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleOpenPixDialog(charge)}
                                className="h-8 gap-1 text-brand-600 mx-auto"
                                disabled={!pixSettings?.chavepix}
                              >
                                <CreditCard className="h-4 w-4" />
                                <span>PIX</span>
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {selectedCharge && pixSettings && condominiumData && (
        <PixDialog
          isOpen={isPixDialogOpen}
          onClose={handleClosePixDialog}
          pixData={{
            keyType: pixSettings.tipochave as 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE',
            pixKey: pixSettings.chavepix,
            amount: BRLToNumber(selectedCharge.amount),
            condominiumName: condominiumData.nomecondominio || matricula || '',
            matricula: matricula || '',
            unit: selectedCharge.unit
          }}
          month={selectedCharge.month}
          year={selectedCharge.year}
          isOverdue={selectedCharge.status === 'overdue'}
          dueDate={selectedCharge.due_date}
          interestRate={pixSettings.jurosaodia || '0.033'}
        />
      )}
    </DashboardLayout>
  );
};

export default MinhasCobrancas;
