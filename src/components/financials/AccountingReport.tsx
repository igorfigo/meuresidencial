
import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { FileDown } from 'lucide-react';
import { useFinances } from '@/hooks/use-finances';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import { useApp } from '@/contexts/AppContext';
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

// Helper function to format date string to DD/MM/YYYY
const formatDateToBR = (dateString) => {
  if (!dateString) return '-';
  
  try {
    // Check if the date is in yyyy-MM-dd format
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    }
    
    // If already in DD/MM/YYYY format, return as is
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse the date if it's in another format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Helper function to format reference month
const formatReferenceMonth = (referenceMonth) => {
  if (!referenceMonth) return '-';
  
  try {
    // If in yyyy-MM format, convert to MM/yyyy
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

// Helper function to get friendly category name
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
  
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };
  
  const getTotalIncome = () => {
    return monthlyIncomes.reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
  };
  
  const getTotalExpense = () => {
    return monthlyExpenses.reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);
  };
  
  const generatePDF = () => {
    setIsGenerating(true);
    
    try {
      const [year, month] = selectedMonth.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = monthDate.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
      const currentDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 15;
      const lineHeight = 7;
      const margin = 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text("Gerado por: www.meuresidencial.com", pageWidth - margin, yPosition, { align: 'right' });
      doc.text(`Relatório gerado em: ${currentDate}`, margin, yPosition);
      yPosition += lineHeight * 2;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const title = `Prestação de Contas - ${monthName} ${year}`;
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2.5;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Condomínio: ${user?.nomeCondominio || "Nome não disponível"}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Matrícula: ${user?.selectedCondominium || "Não disponível"}`, margin, yPosition);
      yPosition += lineHeight * 2;
      
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO FINANCEIRO', margin, yPosition);
      yPosition += lineHeight * 1.2;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Saldo Inicial: R$ ${startBalance}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Total de Receitas: R$ ${formatToBRL(getTotalIncome())}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Total de Despesas: R$ ${formatToBRL(getTotalExpense())}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Saldo Final: R$ ${endBalance}`, margin, yPosition);
      yPosition += lineHeight * 2;
      
      doc.setFont('helvetica', 'bold');
      doc.text('RECEITAS', margin, yPosition);
      yPosition += lineHeight * 1.2;
      
      const incomeColWidths = [40, 25, 35, 30, 30];
      const tableWidth = pageWidth - (margin * 2);
      
      const drawLine = (y: number) => {
        doc.setDrawColor(0);
        doc.line(margin, y, pageWidth - margin, y);
      };
      
      let currentX = margin;
      doc.setFont('helvetica', 'bold');
      
      const incomeHeaders = ['Categoria', 'Unidade', 'Mês Referência', 'Data Pagamento', 'Valor'];
      
      incomeHeaders.forEach((header, i) => {
        doc.text(header, currentX, yPosition);
        currentX += incomeColWidths[i];
      });
      
      yPosition += lineHeight / 2;
      drawLine(yPosition);
      yPosition += lineHeight / 2;
      
      if (monthlyIncomes.length > 0) {
        doc.setFont('helvetica', 'normal');
        
        monthlyIncomes.forEach(income => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text("www.meuresidencial.com", pageWidth - 15, 10, { align: 'right' });
          }
          
          currentX = margin;
          
          doc.text(getCategoryName(income.category), currentX, yPosition);
          currentX += incomeColWidths[0];
          
          doc.text(income.unit || "N/A", currentX, yPosition);
          currentX += incomeColWidths[1];
          
          doc.text(formatReferenceMonth(income.reference_month) || "N/A", currentX, yPosition);
          currentX += incomeColWidths[2];
          
          doc.text(formatDateToBR(income.payment_date) || "N/A", currentX, yPosition);
          currentX += incomeColWidths[3];
          
          doc.text(`R$ ${income.amount}`, currentX, yPosition);
          
          yPosition += lineHeight;
        });
        
        yPosition += lineHeight / 2;
        drawLine(yPosition);
        yPosition += lineHeight / 2;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total', margin, yPosition);
        const totalXPos = margin + incomeColWidths[0] + incomeColWidths[1] + incomeColWidths[2] + incomeColWidths[3];
        doc.text(`R$ ${formatToBRL(getTotalIncome())}`, totalXPos, yPosition);
        
        yPosition += lineHeight * 2;
      } else {
        yPosition += lineHeight;
        doc.setFont('helvetica', 'italic');
        doc.text('Nenhuma receita registrada para este mês', margin, yPosition);
        yPosition += lineHeight * 2;
      }
      
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text("www.meuresidencial.com", pageWidth - 15, 10, { align: 'right' });
      }
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('DESPESAS', margin, yPosition);
      yPosition += lineHeight * 1.2;
      
      const expenseColWidths = [40, 25, 35, 30, 30, 40];
      
      currentX = margin;
      doc.setFont('helvetica', 'bold');
      
      const expenseHeaders = ['Categoria', 'Unidade', 'Mês Referência', 'Vencimento', 'Pagamento', 'Valor'];
      
      expenseHeaders.forEach((header, i) => {
        doc.text(header, currentX, yPosition);
        currentX += expenseColWidths[i];
      });
      
      yPosition += lineHeight / 2;
      drawLine(yPosition);
      yPosition += lineHeight / 2;
      
      if (monthlyExpenses.length > 0) {
        doc.setFont('helvetica', 'normal');
        
        monthlyExpenses.forEach(expense => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text("www.meuresidencial.com", pageWidth - 15, 10, { align: 'right' });
          }
          
          currentX = margin;
          
          doc.text(getCategoryName(expense.category), currentX, yPosition);
          currentX += expenseColWidths[0];
          
          doc.text(expense.unit || "N/A", currentX, yPosition);
          currentX += expenseColWidths[1];
          
          doc.text(formatReferenceMonth(expense.reference_month) || "N/A", currentX, yPosition);
          currentX += expenseColWidths[2];
          
          doc.text(formatDateToBR(expense.due_date) || "N/A", currentX, yPosition);
          currentX += expenseColWidths[3];
          
          doc.text(formatDateToBR(expense.payment_date) || "N/A", currentX, yPosition);
          currentX += expenseColWidths[4];
          
          doc.text(`R$ ${expense.amount}`, currentX, yPosition);
          
          yPosition += lineHeight;
        });
        
        yPosition += lineHeight / 2;
        drawLine(yPosition);
        yPosition += lineHeight / 2;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total', margin, yPosition);
        const totalXPos = margin + expenseColWidths[0] + expenseColWidths[1] + expenseColWidths[2] + expenseColWidths[3] + expenseColWidths[4];
        doc.text(`R$ ${formatToBRL(getTotalExpense())}`, totalXPos, yPosition);
      } else {
        yPosition += lineHeight;
        doc.setFont('helvetica', 'italic');
        doc.text('Nenhuma despesa registrada para este mês', margin, yPosition);
      }
      
      yPosition += lineHeight;
      drawLine(yPosition);
      
      const footerPosition = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(`Relatório gerado pelo sistema Meu Residencial - www.meuresidencial.com - ${currentDate}`, pageWidth / 2, footerPosition, { align: 'center' });
      
      const fileName = `prestacao_contas_${monthName.toLowerCase()}_${year}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (isLoading) {
    return <Skeleton className="w-full h-96" />;
  }
  
  return (
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
          
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating || (monthlyIncomes.length === 0 && monthlyExpenses.length === 0)}
            className="flex items-center gap-2"
          >
            <FileDown size={16} />
            {isGenerating ? 'Gerando...' : 'Baixar Relatório PDF'}
          </Button>
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
  );
};
