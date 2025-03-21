
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
      const monthDate = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = monthDate.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
      
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;
      const lineHeight = 7;
      const margin = 15;
      
      // Title - Improved formatting
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const title = `Prestação de Contas - ${monthName} ${year}`;
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2.5;
      
      // Condominium Information - Improved spacing
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Condomínio: ${user?.nomeCondominio || "Nome não disponível"}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Matrícula: ${user?.selectedCondominium || "Não disponível"}`, margin, yPosition);
      yPosition += lineHeight * 2;
      
      // Financial Summary Section - Better formatting
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
      
      // Incomes Section - Improved table formatting
      doc.setFont('helvetica', 'bold');
      doc.text('RECEITAS', margin, yPosition);
      yPosition += lineHeight * 1.2;
      
      // Table headers for incomes with better spacing
      const incomeColWidths = [45, 25, 45, 30, 50]; // Adjusted column widths
      const tableWidth = pageWidth - (margin * 2);
      
      // Helper function to draw table lines
      const drawLine = (y: number) => {
        doc.setDrawColor(0);
        doc.line(margin, y, pageWidth - margin, y);
      };
      
      // Income table headers
      let currentX = margin;
      doc.setFont('helvetica', 'bold');
      
      // Define header content
      const incomeHeaders = ['Categoria', 'Unidade', 'Data de Pagamento', 'Valor', 'Observações'];
      
      // Draw header cells
      incomeHeaders.forEach((header, i) => {
        doc.text(header, currentX, yPosition);
        currentX += incomeColWidths[i];
      });
      
      yPosition += lineHeight / 2;
      drawLine(yPosition);
      yPosition += lineHeight / 2;
      
      // Income table rows
      if (monthlyIncomes.length > 0) {
        doc.setFont('helvetica', 'normal');
        
        monthlyIncomes.forEach(income => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          currentX = margin;
          
          // Format and display each cell in the row
          doc.text(income.category || "N/A", currentX, yPosition);
          currentX += incomeColWidths[0];
          
          doc.text(income.unit || "N/A", currentX, yPosition);
          currentX += incomeColWidths[1];
          
          doc.text(income.payment_date || "N/A", currentX, yPosition);
          currentX += incomeColWidths[2];
          
          doc.text(`R$ ${income.amount}`, currentX, yPosition);
          currentX += incomeColWidths[3];
          
          const observations = income.observations ? 
                               (income.observations.length > 20 ? 
                               income.observations.substring(0, 20) + '...' : 
                               income.observations) : 
                               "";
          doc.text(observations, currentX, yPosition);
          
          yPosition += lineHeight;
        });
        
        // Total row
        yPosition += lineHeight / 2;
        drawLine(yPosition);
        yPosition += lineHeight / 2;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total', margin, yPosition);
        const totalXPos = margin + incomeColWidths[0] + incomeColWidths[1] + incomeColWidths[2];
        doc.text(`R$ ${formatToBRL(getTotalIncome())}`, totalXPos, yPosition);
        
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
      
      // Expenses Section - Improved table formatting
      doc.setFont('helvetica', 'bold');
      doc.text('DESPESAS', margin, yPosition);
      yPosition += lineHeight * 1.2;
      
      // Table headers for expenses with better spacing
      const expenseColWidths = [45, 25, 30, 30, 30, 40]; // Adjusted column widths
      
      // Expense table headers
      currentX = margin;
      doc.setFont('helvetica', 'bold');
      
      // Define expense header content
      const expenseHeaders = ['Categoria', 'Unidade', 'Vencimento', 'Pagamento', 'Valor', 'Observações'];
      
      // Draw expense header cells
      expenseHeaders.forEach((header, i) => {
        doc.text(header, currentX, yPosition);
        currentX += expenseColWidths[i];
      });
      
      yPosition += lineHeight / 2;
      drawLine(yPosition);
      yPosition += lineHeight / 2;
      
      // Expense table rows
      if (monthlyExpenses.length > 0) {
        doc.setFont('helvetica', 'normal');
        
        monthlyExpenses.forEach(expense => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          currentX = margin;
          
          // Format and display each cell in the row
          doc.text(expense.category || "N/A", currentX, yPosition);
          currentX += expenseColWidths[0];
          
          doc.text(expense.unit || "N/A", currentX, yPosition);
          currentX += expenseColWidths[1];
          
          doc.text(expense.due_date || "N/A", currentX, yPosition);
          currentX += expenseColWidths[2];
          
          doc.text(expense.payment_date || "N/A", currentX, yPosition);
          currentX += expenseColWidths[3];
          
          doc.text(`R$ ${expense.amount}`, currentX, yPosition);
          currentX += expenseColWidths[4];
          
          const observations = expense.observations ? 
                              (expense.observations.length > 15 ? 
                              expense.observations.substring(0, 15) + '...' : 
                              expense.observations) : 
                              "";
          doc.text(observations, currentX, yPosition);
          
          yPosition += lineHeight;
        });
        
        // Total row
        yPosition += lineHeight / 2;
        drawLine(yPosition);
        yPosition += lineHeight / 2;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total', margin, yPosition);
        const totalXPos = margin + expenseColWidths[0] + expenseColWidths[1] + expenseColWidths[2] + expenseColWidths[3];
        doc.text(`R$ ${formatToBRL(getTotalExpense())}`, totalXPos, yPosition);
      } else {
        yPosition += lineHeight;
        doc.setFont('helvetica', 'italic');
        doc.text('Nenhuma despesa registrada para este mês', margin, yPosition);
      }
      
      // Draw final separator line
      yPosition += lineHeight;
      drawLine(yPosition);
      
      // Save PDF with appropriate month name in filename
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
