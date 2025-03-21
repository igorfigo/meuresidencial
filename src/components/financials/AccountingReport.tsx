
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
      const filteredIncomes = incomes.filter(income => 
        income.reference_month === selectedMonth
      );
      
      const filteredExpenses = expenses.filter(expense => 
        expense.reference_month === selectedMonth
      );
      
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
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('pt-BR', { month: 'long' });
      
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;
      const lineHeight = 7;
      const margin = 10;
      
      // Title and Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const title = `Prestação de Contas - ${monthName.toUpperCase()} ${year}`;
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;
      
      // Condominium Information
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Condomínio: ${user?.nomeCondominio || "Nome não disponível"}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Matrícula: ${user?.selectedCondominium || "Não disponível"}`, margin, yPosition);
      yPosition += lineHeight * 2;
      
      // Financial Summary Section
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO FINANCEIRO', margin, yPosition);
      yPosition += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(`Saldo Inicial: R$ ${startBalance}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Total de Receitas: R$ ${formatToBRL(getTotalIncome())}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Total de Despesas: R$ ${formatToBRL(getTotalExpense())}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Saldo Final: R$ ${endBalance}`, margin, yPosition);
      yPosition += lineHeight * 2;
      
      // Incomes Section
      doc.setFont('helvetica', 'bold');
      doc.text('RECEITAS', margin, yPosition);
      yPosition += lineHeight;
      
      // Table headers for incomes
      const incomeHeaders = ['Categoria', 'Unidade', 'Data de Pagamento', 'Valor', 'Observações'];
      const incomeColumnWidths = [40, 20, 40, 25, 55];
      let startX = margin;
      
      // Draw income headers
      incomeHeaders.forEach((header, index) => {
        doc.text(header, startX, yPosition);
        startX += incomeColumnWidths[index];
      });
      yPosition += lineHeight;
      
      // Draw separator line
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      
      // Add income rows
      if (monthlyIncomes.length > 0) {
        monthlyIncomes.forEach(income => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          startX = margin;
          doc.setFont('helvetica', 'normal');
          doc.text(income.category?.substring(0, 18) || "N/A", startX, yPosition, { maxWidth: incomeColumnWidths[0] - 2 });
          startX += incomeColumnWidths[0];
          
          doc.text(income.unit || "N/A", startX, yPosition);
          startX += incomeColumnWidths[1];
          
          doc.text(income.payment_date || "N/A", startX, yPosition);
          startX += incomeColumnWidths[2];
          
          doc.text(`R$ ${income.amount}`, startX, yPosition);
          startX += incomeColumnWidths[3];
          
          doc.text(income.observations?.substring(0, 20) || "", startX, yPosition, { maxWidth: incomeColumnWidths[4] - 2 });
          
          yPosition += lineHeight;
        });
        
        // Add total row
        yPosition += lineHeight / 2;
        doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
        yPosition += lineHeight / 2;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total', margin, yPosition);
        doc.text(`R$ ${formatToBRL(getTotalIncome())}`, margin + incomeColumnWidths[0] + incomeColumnWidths[1] + incomeColumnWidths[2], yPosition);
        
        yPosition += lineHeight * 2;
      } else {
        yPosition += lineHeight;
        doc.setFont('helvetica', 'italic');
        doc.text('Nenhuma receita registrada para este mês', margin, yPosition);
        yPosition += lineHeight * 2;
      }
      
      // Check if we need a new page for expenses
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Expenses Section
      doc.setFont('helvetica', 'bold');
      doc.text('DESPESAS', margin, yPosition);
      yPosition += lineHeight;
      
      // Table headers for expenses
      const expenseHeaders = ['Categoria', 'Unidade', 'Vencimento', 'Pagamento', 'Valor', 'Observações'];
      const expenseColumnWidths = [35, 15, 25, 25, 25, 55];
      startX = margin;
      
      // Draw expense headers
      expenseHeaders.forEach((header, index) => {
        doc.text(header, startX, yPosition);
        startX += expenseColumnWidths[index];
      });
      yPosition += lineHeight;
      
      // Draw separator line
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      
      // Add expense rows
      if (monthlyExpenses.length > 0) {
        monthlyExpenses.forEach(expense => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          startX = margin;
          doc.setFont('helvetica', 'normal');
          doc.text(expense.category?.substring(0, 16) || "N/A", startX, yPosition, { maxWidth: expenseColumnWidths[0] - 2 });
          startX += expenseColumnWidths[0];
          
          doc.text(expense.unit || "N/A", startX, yPosition);
          startX += expenseColumnWidths[1];
          
          doc.text(expense.due_date || "N/A", startX, yPosition);
          startX += expenseColumnWidths[2];
          
          doc.text(expense.payment_date || "N/A", startX, yPosition);
          startX += expenseColumnWidths[3];
          
          doc.text(`R$ ${expense.amount}`, startX, yPosition);
          startX += expenseColumnWidths[4];
          
          doc.text(expense.observations?.substring(0, 20) || "", startX, yPosition, { maxWidth: expenseColumnWidths[5] - 2 });
          
          yPosition += lineHeight;
        });
        
        // Add total row
        yPosition += lineHeight / 2;
        doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
        yPosition += lineHeight / 2;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total', margin, yPosition);
        doc.text(`R$ ${formatToBRL(getTotalExpense())}`, margin + expenseColumnWidths[0] + expenseColumnWidths[1] + expenseColumnWidths[2] + expenseColumnWidths[3], yPosition);
      } else {
        yPosition += lineHeight;
        doc.setFont('helvetica', 'italic');
        doc.text('Nenhuma despesa registrada para este mês', margin, yPosition);
      }
      
      // Save PDF
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
                  <span className="text-sm font-medium">Saldo Final:</span>
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
                  <span className="font-medium">{format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: ptBR })}</span>
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
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyIncomes.map(income => (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium">{income.category}</TableCell>
                        <TableCell>{income.unit || '-'}</TableCell>
                        <TableCell>{income.payment_date || '-'}</TableCell>
                        <TableCell className="text-right text-green-600">R$ {income.amount}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="font-bold">Total</TableCell>
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
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyExpenses.map(expense => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.category}</TableCell>
                        <TableCell>{expense.unit || '-'}</TableCell>
                        <TableCell>{expense.due_date || '-'}</TableCell>
                        <TableCell>{expense.payment_date || '-'}</TableCell>
                        <TableCell className="text-right text-red-600">R$ {expense.amount}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="font-bold">Total</TableCell>
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
