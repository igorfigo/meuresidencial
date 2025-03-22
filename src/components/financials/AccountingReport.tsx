import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileDown, 
  Send, 
  Mail, 
  MessageSquare, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { useFinances } from '@/hooks/use-finances';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

const getLast12Months = () => {
  const months = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: ptBR })
    });
  }
  
  return months;
};

const formatDateToBR = (dateString) => {
  if (!dateString) return '-';
  
  try {
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    }
    
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

const formatReferenceMonth = (referenceMonth) => {
  if (!referenceMonth) return '-';
  
  try {
    if (/^\d{4}-\d{2}$/.test(referenceMonth)) {
      const [year, month] = referenceMonth.split('-');
      return `${month}/${year}`;
    }
    
    return referenceMonth;
  } catch (error) {
    console.error("Error formatting reference month:", error);
    return referenceMonth;
  }
};

const getCategoryName = (category) => {
  const categoryMap = {
    'taxa_condominio': 'Taxa de Condomínio',
    'reserva_area_comum': 'Reserva Área Comum',
    'taxa_extra': 'Taxa Extra',
    'multa': 'Multa',
    'outros_receita': 'Outros (Receita)',
    'energia': 'Energia',
    'agua': 'Água',
    'manutencao': 'Manutenção',
    'gas': 'Gás',
    'limpeza': 'Limpeza',
    'produtos': 'Produtos',
    'imposto': 'Imposto',
    'seguranca': 'Segurança',
    'sistema_condominio': 'Sistema Condomínio',
    'outros_despesa': 'Outros (Despesa)'
  };
  
  return categoryMap[category] || category;
};

export const AccountingReport = () => {
  const { user } = useApp();
  const { incomes, expenses, balance, isLoading, refreshData } = useFinances();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [monthlyIncomes, setMonthlyIncomes] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [startBalance, setStartBalance] = useState('0,00');
  const [endBalance, setEndBalance] = useState('0,00');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sendOptions, setSendOptions] = useState({
    email: false,
    whatsapp: false
  });
  const [isSending, setIsSending] = useState(false);
  const [reportLogs, setReportLogs] = useState<any[]>([]);
  const [isDeletingLog, setIsDeletingLog] = useState<string | null>(null);
  
  const months = getLast12Months();
  
  useEffect(() => {
    if (!isLoading) {
      const filteredIncomes = incomes.filter(income => {
        if (!income.payment_date) return false;
        
        const paymentDate = new Date(income.payment_date);
        const paymentYearMonth = format(paymentDate, 'yyyy-MM');
        
        return paymentYearMonth === selectedMonth;
      });
      
      const filteredExpenses = expenses.filter(expense => {
        if (!expense.payment_date) return false;
        
        const paymentDate = new Date(expense.payment_date);
        const paymentYearMonth = format(paymentDate, 'yyyy-MM');
        
        return paymentYearMonth === selectedMonth;
      });
      
      setMonthlyIncomes(filteredIncomes);
      setMonthlyExpenses(filteredExpenses);
      
      const totalIncome = filteredIncomes.reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
      const totalExpense = filteredExpenses.reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);
      
      const currentBalance = balance?.balance ? BRLToNumber(balance.balance) : 0;
      const estimatedStartBalance = currentBalance - totalIncome + totalExpense;
      
      setStartBalance(formatToBRL(estimatedStartBalance));
      setEndBalance(balance?.balance || formatToBRL(currentBalance));
    }
  }, [isLoading, selectedMonth, incomes, expenses, balance]);
  
  useEffect(() => {
    fetchReportLogs();
  }, [user?.selectedCondominium]);
  
  const fetchReportLogs = async () => {
    if (!user?.selectedCondominium) return;
    
    try {
      const { data, error } = await supabase
        .from('accounting_report_logs')
        .select('*')
        .eq('matricula', user.selectedCondominium)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching report logs:', error);
        return;
      }
      
      setReportLogs(data || []);
    } catch (error) {
      console.error('Error in fetchReportLogs:', error);
    }
  };
  
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };
  
  const getTotalIncome = () => {
    return monthlyIncomes.reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
  };
  
  const getTotalExpense = () => {
    return monthlyExpenses.reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);
  };
  
  const generatePDF = (shouldDownload = true) => {
    setIsGenerating(true);
    
    try {
      const [year, month] = selectedMonth.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = monthDate.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
      const currentDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      
      const doc = new jsPDF();
      doc.setFontSize(11);
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;
      const lineHeight = 7;
      const margin = 15;
      
      doc.setFillColor(240, 247, 255);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 5, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Relatório gerado em: " + currentDate, margin, yPosition);
      doc.text("Gerado por: www.meuresidencial.com", pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 10;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      const title = `Prestação de Contas - ${monthName} ${year}`;
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2.5;
      
      doc.setFillColor(244, 247, 247);
      doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 35, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(`Condomínio: ${user?.nomeCondominio || "Nome não disponível"}`, pageWidth / 2, yPosition + 5, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Matrícula: ${user?.selectedCondominium || "Não disponível"}`, pageWidth / 2, yPosition + 15, { align: 'center' });
      
      let addressText = "Endereço não disponível";
      
      if (user) {
        const addressParts = [];
        if (user.rua) addressParts.push(user.rua);
        if (user.numero) addressParts.push(user.numero);
        if (user.complemento) addressParts.push(user.complemento);
        if (user.bairro) addressParts.push(user.bairro);
        if (user.cidade) addressParts.push(user.cidade);
        if (user.estado) addressParts.push(user.estado);
        if (user.cep) addressParts.push(user.cep);
        
        if (addressParts.length > 0) {
          addressText = addressParts.join(', ');
        }
      }
      
      doc.text(`Endereço: ${addressText}`, pageWidth / 2, yPosition + 25, { align: 'center' });
      
      yPosition += lineHeight * 6;
      
      doc.setFillColor(243, 250, 247);
      doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 42, 3, 3, 'F');
      
      doc.setFillColor(45, 122, 128);
      doc.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('RESUMO FINANCEIRO', pageWidth / 2, yPosition + 5.5, { align: 'center' });
      yPosition += 15;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text(`Saldo Inicial: R$ ${startBalance}`, margin + 10, yPosition);
      yPosition += lineHeight;
      
      doc.setTextColor(16, 122, 87);
      doc.text(`Total de Receitas: R$ ${formatToBRL(getTotalIncome())}`, margin + 10, yPosition);
      yPosition += lineHeight;
      
      doc.setTextColor(185, 28, 28);
      doc.text(`Total de Despesas: R$ ${formatToBRL(getTotalExpense())}`, margin + 10, yPosition);
      yPosition += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(`Saldo Final: R$ ${endBalance}`, margin + 10, yPosition);
      yPosition += lineHeight * 3;
      
      const drawTableHeader = (headers, columnWidths, y, textColor) => {
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 6, pageWidth - (margin * 2), 8, 'FD');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        
        let currentX = margin;
        headers.forEach((header, i) => {
          const headerWidth = columnWidths[i];
          doc.text(header, currentX + (headerWidth / 2), y - 1, { align: 'center' });
          currentX += headerWidth;
        });
        
        return y + 4;
      };
      
      const drawTableRows = (rows, columnWidths, y, getValue, textColor) => {
        doc.setFont('helvetica', 'normal');
        
        let currentY = y;
        
        rows.forEach((row, rowIndex) => {
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
            
            doc.setFillColor(59, 130, 246);
            doc.rect(0, 0, pageWidth, 5, 'F');
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 116, 139);
            doc.text("www.meuresidencial.com", pageWidth - 15, 10, { align: 'right' });
          }
          
          if (rowIndex % 2 === 0) {
            doc.setFillColor(248, 250, 252);
          } else {
            doc.setFillColor(255, 255, 255);
          }
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, currentY - 4, pageWidth - (margin * 2), 7, 'FD');
          
          let currentX = margin;
          
          const values = getValue(row);
          values.forEach((value, colIndex) => {
            const columnWidth = columnWidths[colIndex];
            
            if (colIndex === values.length - 1) {
              doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            } else {
              doc.setTextColor(31, 41, 55);
            }
            
            doc.text(value, currentX + (columnWidth / 2), currentY, { align: 'center' });
            currentX += columnWidth;
          });
          
          currentY += lineHeight;
        });
        
        return currentY;
      };
      
      if (monthlyIncomes.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 122, 87);
        doc.text('RECEITAS', margin, yPosition);
        yPosition += 8;
        
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, yPosition - 8, pageWidth - (margin * 2), monthlyIncomes.length * lineHeight + 15, 'D');
        
        const tableWidth = pageWidth - (margin * 2);
        const incomeColWidths = [
          tableWidth * 0.25,
          tableWidth * 0.15,
          tableWidth * 0.20,
          tableWidth * 0.20,
          tableWidth * 0.20
        ];
        
        const incomeHeaders = ['Categoria', 'Unidade', 'Mês Referência', 'Data Pagamento', 'Valor'];
        
        yPosition = drawTableHeader(incomeHeaders, incomeColWidths, yPosition, [16, 122, 87]);
        
        yPosition = drawTableRows(monthlyIncomes, incomeColWidths, yPosition, (income) => [
          getCategoryName(income.category),
          income.unit || "N/A",
          formatReferenceMonth(income.reference_month) || "N/A",
          formatDateToBR(income.payment_date) || "N/A",
          `R$ ${income.amount}`
        ], [16, 122, 87]);
        
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPosition - 2, pageWidth - (margin * 2), 8, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 122, 87);
        
        doc.text('Total', margin + (incomeColWidths[0] / 2), yPosition + 3, { align: 'center' });
        
        const totalAmountX = margin + incomeColWidths[0] + incomeColWidths[1] + 
                            incomeColWidths[2] + incomeColWidths[3] + (incomeColWidths[4] / 2);
        doc.text(`R$ ${formatToBRL(getTotalIncome())}`, totalAmountX, yPosition + 3, { align: 'center' });
        
        yPosition += lineHeight * 3;
      } else {
        doc.setFillColor(243, 244, 246);
        doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 20, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128);
        doc.text('Nenhuma receita registrada para este mês', pageWidth / 2, yPosition + 10, { align: 'center' });
        
        yPosition += 30;
      }
      
      if (yPosition > 230 && monthlyExpenses.length > 0) {
        doc.addPage();
        yPosition = 20;
        
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, pageWidth, 5, 'F');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text("www.meuresidencial.com", pageWidth - 15, 10, { align: 'right' });
      }
      
      if (monthlyExpenses.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28);
        doc.text('DESPESAS', margin, yPosition);
        yPosition += 8;
        
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, yPosition - 8, pageWidth - (margin * 2), monthlyExpenses.length * lineHeight + 15, 'D');
        
        const tableWidth = pageWidth - (margin * 2);
        const expenseColWidths = [
          tableWidth * 0.20,
          tableWidth * 0.12,
          tableWidth * 0.17,
          tableWidth * 0.17,
          tableWidth * 0.17,
          tableWidth * 0.17
        ];
        
        const expenseHeaders = ['Categoria', 'Unidade', 'Mês Referência', 'Vencimento', 'Pagamento', 'Valor'];
        
        yPosition = drawTableHeader(expenseHeaders, expenseColWidths, yPosition, [185, 28, 28]);
        
        yPosition = drawTableRows(monthlyExpenses, expenseColWidths, yPosition, (expense) => [
          getCategoryName(expense.category),
          expense.unit || "N/A",
          formatReferenceMonth(expense.reference_month) || "N/A",
          formatDateToBR(expense.due_date) || "N/A",
          formatDateToBR(expense.payment_date) || "N/A",
          `R$ ${expense.amount}`
        ], [185, 28, 28]);
        
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPosition - 2, pageWidth - (margin * 2), 8, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28);
        
        doc.text('Total', margin + (expenseColWidths[0] / 2), yPosition + 3, { align: 'center' });
        
        const totalAmountX = margin + expenseColWidths[0] + expenseColWidths[1] + 
                            expenseColWidths[2] + expenseColWidths[3] + expenseColWidths[4] + 
                            (expenseColWidths[5] / 2);
        doc.text(`R$ ${formatToBRL(getTotalExpense())}`, totalAmountX, yPosition + 3, { align: 'center' });
      } else {
        doc.setFillColor(243, 244, 246);
        doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 20, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128);
        doc.text('Nenhuma despesa registrada para este mês', pageWidth / 2, yPosition + 10, { align: 'center' });
      }
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      
      doc.setFillColor(246, 249, 252);
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
      
      doc.text(`Relatório gerado pelo sistema Meu Residencial - www.meuresidencial.com - ${currentDate}`, 
               pageWidth / 2, pageHeight - 5, { align: 'center' });
      
      const fileName = `prestacao_contas_${monthName.toLowerCase()}_${year}.pdf`;
      
      const pdfData = doc.output('datauristring');
      
      if (shouldDownload) {
        doc.save(fileName);
      }
      
      return pdfData;
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGeneratePDF = () => {
    generatePDF(true);
  };
  
  const sendReportToResidents = async () => {
    if (!sendOptions.email && !sendOptions.whatsapp) {
      toast.error('Selecione pelo menos uma opção de envio');
      return;
    }
    
    setIsSending(true);
    
    try {
      const [year, month] = selectedMonth.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = monthDate.toLocaleString('pt-BR', { month: 'long' });
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Erro ao obter sessão: ${sessionError.message}`);
      }
      
      const accessToken = sessionData?.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Você precisa estar autenticado para enviar relatórios');
      }
      
      const pdfData = generatePDF(false);
      
      if (!pdfData) {
        toast.error('Erro ao gerar o relatório PDF');
        return;
      }
      
      if (sendOptions.email) {
        const response = await fetch('https://kcbvdcacgbwigefwacrk.supabase.co/functions/v1/send-accounting-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            matricula: user?.selectedCondominium,
            report_month: monthName,
            report_year: year,
            report_data: pdfData
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao enviar o relatório');
        }
        
        const result = await response.json();
        
        toast.success(`Relatório enviado com sucesso para ${result.sent_count} moradores por e-mail`);
        fetchReportLogs();
      }
      
      if (sendOptions.whatsapp) {
        toast.info('Envio por WhatsApp será implementado em breve');
      }
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      toast.error(`Erro ao enviar relatório: ${error.message}`);
    } finally {
      setIsSending(false);
      setIsDialogOpen(false);
      setSendOptions({ email: false, whatsapp: false });
    }
  };
  
  const deleteReportLog = async (logId: string) => {
    if (!logId) return;
    
    setIsDeletingLog(logId);
    
    try {
      const { error } = await supabase
        .from('accounting_report_logs')
        .delete()
        .eq('id', logId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Registro de envio excluído com sucesso');
      setReportLogs(prev => prev.filter(log => log.id !== logId));
    } catch (error) {
      console.error('Erro ao excluir registro de envio:', error);
      toast.error(`Erro ao excluir registro: ${error.message}`);
    } finally {
      setIsDeletingLog(null);
    }
  };
  
  if (isLoading) {
    return <Skeleton className="w-full h-96" />;
  }
  
  return (
    <>
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="w-full sm:w-64 mb-4 sm:mb-0">
              <Label htmlFor="month" className="mb-1 block">Mês de Referência</Label>
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleGeneratePDF} 
                disabled={isGenerating || (monthlyIncomes.length === 0 && monthlyExpenses.length === 0)}
                className="flex items-center gap-2"
              >
                <FileDown size={16} />
                {isGenerating ? 'Gerando...' : 'Baixar Relatório PDF'}
              </Button>
              
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                disabled={isGenerating || isSending || (monthlyIncomes.length === 0 && monthlyExpenses.length === 0)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                variant="default"
              >
                <Send size={16} />
                Prestar Contas aos Moradores
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium text-lg mb-2">Resumo do Mês</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-sm text-gray-600">Saldo Inicial (Estimado):</span>
                    <span className="font-medium">R$ {startBalance}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-sm text-gray-600">Total de Receitas:</span>
                    <span className="font-medium text-green-600">+ R$ {formatToBRL(getTotalIncome())}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-sm text-gray-600">Total de Despesas:</span>
                    <span className="font-medium text-red-600">- R$ {formatToBRL(getTotalExpense())}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-gray-600">Saldo Final:</span>
                    <span className="font-bold text-brand-600">R$ {endBalance}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium text-lg mb-2">Detalhes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-sm text-gray-600">Mês de Referência:</span>
                    <span className="font-medium">{format(parse(selectedMonth + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy', { locale: ptBR })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-sm text-gray-600">Receitas Registradas:</span>
                    <span className="font-medium">{monthlyIncomes.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-sm text-gray-600">Despesas Registradas:</span>
                    <span className="font-medium">{monthlyExpenses.length}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-gray-600">Resultado do Mês:</span>
                    <span className={`font-medium ${getTotalIncome() - getTotalExpense() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {formatToBRL(getTotalIncome() - getTotalExpense())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {reportLogs.length > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-4">
                <h3 className="font-medium text-lg mb-3">Histórico de Prestações de Contas Enviadas</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data de Envio</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Meio de Envio</TableHead>
                        <TableHead>Unidades Enviadas</TableHead>
                        <TableHead>Qtd. Enviada</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportLogs.map(log => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDateToBR(log.created_at)}</TableCell>
                          <TableCell>{log.report_month}</TableCell>
                          <TableCell>
                            {log.sent_via === 'email' ? (
                              <div className="flex items-center gap-1">
                                <Mail size={14} className="text-blue-500" />
                                <span>E-mail</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <MessageSquare size={14} className="text-green-500" />
                                <span>WhatsApp</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{log.sent_units || '-'}</TableCell>
                          <TableCell>{log.sent_count}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteReportLog(log.id)}
                              disabled={Boolean(isDeletingLog)}
                            >
                              {isDeletingLog === log.id ? (
                                <Skeleton className="h-5 w-5 rounded-full" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-8">
            <div>
              <h3 className="font-medium text-lg mb-4">Receitas do Mês</h3>
              {monthlyIncomes.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Mês Referência</TableHead>
                        <TableHead>Data de Pagamento</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyIncomes.map(income => (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">{getCategoryName(income.category)}</TableCell>
                          <TableCell>{income.unit || '-'}</TableCell>
                          <TableCell>{formatReferenceMonth(income.reference_month) || '-'}</TableCell>
                          <TableCell>{formatDateToBR(income.payment_date) || '-'}</TableCell>
                          <TableCell className="text-right text-green-600">R$ {income.amount}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          R$ {formatToBRL(getTotalIncome())}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md border">
                  <p className="text-gray-500">Nenhuma receita registrada para este mês</p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Despesas do Mês</h3>
              {monthlyExpenses.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Mês Referência</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Data de Pagamento</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyExpenses.map(expense => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{getCategoryName(expense.category)}</TableCell>
                          <TableCell>{expense.unit || '-'}</TableCell>
                          <TableCell>{formatReferenceMonth(expense.reference_month) || '-'}</TableCell>
                          <TableCell>{formatDateToBR(expense.due_date) || '-'}</TableCell>
                          <TableCell>{formatDateToBR(expense.payment_date) || '-'}</TableCell>
                          <TableCell className="text-right text-red-600">R$ {expense.amount}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={5} className="font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          R$ {formatToBRL(getTotalExpense())}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md border">
                  <p className="text-gray-500">Nenhuma despesa registrada para este mês</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Prestar Contas aos Moradores</DialogTitle>
            <DialogDescription>
              Selecione as opções de envio da prestação de contas aos moradores. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="send-email" 
                checked={sendOptions.email}
                onCheckedChange={(checked) => 
                  setSendOptions(prev => ({...prev, email: checked === true}))
                }
              />
              <label htmlFor="send-email" className="flex gap-2 items-center cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                <Mail size={16} className="text-blue-500" />
                Enviar por E-mail aos Moradores
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="send-whatsapp" 
                checked={sendOptions.whatsapp}
                disabled={true}
                onCheckedChange={(checked) => 
                  setSendOptions(prev => ({...prev, whatsapp: checked === true}))
                }
              />
              <label htmlFor="send-whatsapp" className="flex gap-2 items-center cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                <MessageSquare size={16} className="text-green-500" />
                Enviar por WhatsApp aos Moradores (em breve)
              </label>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 rounded-md p-3 mt-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  Atenção: O relatório será enviado para todos os moradores que possuem email cadastrado no sistema. Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSending}>
              Cancelar
            </Button>
            <Button 
              onClick={sendReportToResidents} 
              disabled={isSending || (!sendOptions.email && !sendOptions.whatsapp)}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSending ? 'Enviando...' : 'Enviar Prestação de Contas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
