
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCodeDisplay } from '@/components/payments/QrCodeDisplay';

interface Charge {
  id: string;
  unit: string;
  reference_month: string;
  amount: string;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  payment_date: string | null;
  category: string;
  observations?: string;
}

interface PixSettings {
  tipochave: string;
  chavepix: string;
  diavencimento: string;
  jurosaodia: string;
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

function formatMonthYear(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, 'MMMM yyyy', { locale: ptBR });
  } catch (error) {
    return dateString;
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    return dateString || "-";
  }
}

const MinhasCobrancas = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  
  const residentId = user?.residentId;
  const matricula = user?.matricula;
  const unit = user?.unit;
  
  // Fetch PIX settings
  const { data: pixSettings } = useQuery({
    queryKey: ['pix-settings', matricula],
    queryFn: async () => {
      if (!matricula) return null;

      const { data, error } = await supabase
        .from('pix_receipt_settings')
        .select('*')
        .eq('matricula', matricula)
        .single();
        
      if (error) {
        console.error('Error fetching PIX settings:', error);
        return null;
      }
      
      return data as PixSettings;
    },
    enabled: !!matricula
  });
  
  // Current year for filtering upcoming months
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Fetch financial incomes for the resident's unit - only taxa_condominio category
  const { data: charges, isLoading, error } = useQuery({
    queryKey: ['resident-incomes', matricula, unit],
    queryFn: async () => {
      if (!matricula || !unit) return [];

      const { data, error } = await supabase
        .from('financial_incomes')
        .select('*')
        .eq('matricula', matricula)
        .eq('unit', unit)
        .eq('category', 'taxa_condominio')
        .order('reference_month', { ascending: false });
        
      if (error) {
        console.error('Error fetching charges:', error);
        throw new Error('Erro ao buscar cobranças');
      }
      
      // Process charges to determine if any are overdue and create due_date based on PIX settings
      const today = new Date();
      return (data || []).map((income) => {
        const referenceMonth = new Date(income.reference_month);
        
        // Calculate due date based on PIX settings day of month
        const dueDay = pixSettings?.diavencimento || '10';
        const dueDate = new Date(
          referenceMonth.getFullYear(),
          referenceMonth.getMonth(),
          parseInt(dueDay)
        );
        
        // If the due date is in the past, move to next month
        if (dueDate < referenceMonth) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        
        // Determine status
        let status: 'pending' | 'paid' | 'overdue' = 'pending';
        if (income.payment_date) {
          status = 'paid';
        } else if (dueDate < today) {
          status = 'overdue';
        }
        
        return {
          ...income,
          status,
          due_date: dueDate.toISOString().split('T')[0]
        } as Charge;
      });
    },
    enabled: !!matricula && !!unit
  });

  // Filter charges for current and future months of the current year for the pending tab
  const pendingCharges = charges?.filter(charge => {
    const chargeDate = new Date(charge.reference_month);
    const chargeYear = chargeDate.getFullYear();
    const chargeMonth = chargeDate.getMonth();
    
    // If it's already paid, don't show it in pending tab
    if (charge.status === 'paid') {
      return false;
    }
    
    // For pending tab, show all charges from current month onwards for the current year
    return chargeYear === currentYear && chargeMonth >= currentMonth;
  }) || [];

  // Filter charges for paid tab - show ALL paid charges
  const paidCharges = charges?.filter(charge => charge.status === 'paid') || [];
  
  // Get the charges to display based on active tab
  const displayCharges = activeTab === 'pending' ? pendingCharges : paidCharges;

  const handleOpenQrCode = (charge: Charge) => {
    setSelectedCharge(charge);
    setQrCodeOpen(true);
  };

  const handleCloseQrCode = () => {
    setQrCodeOpen(false);
    setSelectedCharge(null);
  };

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
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  Ocorreu um erro ao carregar as cobranças. Por favor, tente novamente mais tarde.
                </AlertDescription>
              </Alert>
            ) : displayCharges.length === 0 ? (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Nenhuma cobrança encontrada</AlertTitle>
                <AlertDescription>
                  Não existem cobranças {activeTab === 'pending' ? 'pendentes' : 'pagas'} registradas para esta unidade.
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
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayCharges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell className="font-medium">
                          {formatMonthYear(charge.reference_month)}
                        </TableCell>
                        <TableCell>{charge.unit}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(charge.amount))}</TableCell>
                        <TableCell>{formatDate(charge.due_date)}</TableCell>
                        <TableCell>{formatDate(charge.payment_date)}</TableCell>
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
                          {charge.status !== 'paid' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-brand-600 hover:text-brand-800 hover:bg-brand-50"
                              onClick={() => handleOpenQrCode(charge)}
                            >
                              <FileDown className="h-4 w-4 mr-1" />
                              Gerar Boleto/PIX
                            </Button>
                          )}
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

      {/* QR Code Dialog */}
      <Dialog open={qrCodeOpen} onOpenChange={handleCloseQrCode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code abaixo para realizar o pagamento
            </DialogDescription>
          </DialogHeader>
          
          {selectedCharge && pixSettings && (
            <QrCodeDisplay 
              charge={selectedCharge}
              pixSettings={pixSettings}
              condominiumName={user?.nomeCondominio || 'Condomínio'}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MinhasCobrancas;
