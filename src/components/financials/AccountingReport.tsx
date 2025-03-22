
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
      
      // Create document with slightly larger default font size
      const doc = new jsPDF();
      doc.setFontSize(11);
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;
      const lineHeight = 7;
      const margin = 15;
      
      // Background subtle color for header
      doc.setFillColor(240, 247, 255);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Top branding bar
      doc.setFillColor(59, 130, 246); // Blue brand color
      doc.rect(0, 0, pageWidth, 5, 'F');
      
      // Header - Info line
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text("Relatório gerado em: " + currentDate, margin, yPosition);
      doc.text("Gerado por: www.meuresidencial.com", pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 10;
      
      // Main Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55); // Gray-800
      const title = `Prestação de Contas - ${monthName} ${year}`;
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2.5;
      
      // Condominium Info - Centered with address
      doc.setFillColor(244, 247, 254); // Light blue background
      doc.roundedRect(margin, yPosition - 5, pageWidth - (margin * 2), 35, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55); // Gray-800
      doc.text(`Condomínio: ${user?.nomeCondominio || "Nome não disponível"}`, pageWidth / 2, yPosition + 5, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Matrícula: ${user?.selectedCondominium || "Não disponível"}`, pageWidth / 2, yPosition + 15, { align: 'center' });
      
      // Prepare address text
      let addressText = "Endereço não disponível";
      
      if (user) {
        // Collect address parts from the available user data
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
      
      // Financial Summary Box
      doc.setFillColor(243, 250, 247); // Light green background
      doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 42, 3, 3, 'F');
      
      // Summary Title with colored bar
      doc.setFillColor(45, 122, 128); // Teal color
      doc.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255); // White
      doc.text('RESUMO FINANCEIRO', pageWidth / 2, yPosition + 5.5, { align: 'center' });
      yPosition += 15;
      
      // Summary Content
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55); // Gray-800
      doc.text(`Saldo Inicial: R$ ${startBalance}`, margin + 10, yPosition);
      yPosition += lineHeight;
      
      doc.setTextColor(16, 122, 87); // Green-700
      doc.text(`Total de Receitas: R$ ${formatToBRL(getTotalIncome())}`, margin + 10, yPosition);
      yPosition += lineHeight;
      
      doc.setTextColor(185, 28, 28); // Red-700
      doc.text(`Total de Despesas: R$ ${formatToBRL(getTotalExpense())}`, margin + 10, yPosition);
      yPosition += lineHeight;
      
      // Final balance with emphasis
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55); // Gray-800
      doc.text(`Saldo Final: R$ ${endBalance}`, margin + 10, yPosition);
      yPosition += lineHeight * 3;
      
      // Helper function to draw table headers 
      const drawTableHeader = (headers, columnWidths, y, textColor) => {
        // Table header background
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 6, pageWidth - (margin * 2), 8, 'FD');
        
        // Table header text
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        
        let currentX = margin;
        headers.forEach((header, i) => {
          // Center the header text within its column
          const headerWidth = columnWidths[i];
          doc.text(header, currentX + (headerWidth / 2), y - 1, { align: 'center' });
          currentX += headerWidth;
        });
        
        return y + 4;
      };
      
      // Helper function to draw table rows with alternating colors
      const drawTableRows = (rows, columnWidths, y, getValue, textColor) => {
        doc.setFont('helvetica', 'normal');
        
        let currentY = y;
        
        rows.forEach((row, rowIndex) => {
          // Check if we need a new page
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
            
            // Add header to new page
            doc.setFillColor(59, 130, 246); // Blue brand color
            doc.rect(0, 0, pageWidth, 5, 'F');
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 116, 139); // Slate-500
            doc.text("www.meuresidencial.com", pageWidth - 15, 10, { align: 'right' });
          }
          
          // Draw alternating row background
          if (rowIndex % 2 === 0) {
            doc.setFillColor(248, 250, 252); // Slate-50
          } else {
            doc.setFillColor(255, 255, 255); // White for odd rows
          }
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, currentY - 4, pageWidth - (margin * 2), 7, 'FD');
          
          let currentX = margin;
          
          // Get values for each column and draw them
          const values = getValue(row);
          values.forEach((value, colIndex) => {
            const columnWidth = columnWidths[colIndex];
            
            // Different color for amounts (last column)
            if (colIndex === values.length - 1) {
              doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            } else {
              doc.setTextColor(31, 41, 55); // Gray-800
            }
            
            // Center the text in each cell
            doc.text(value, currentX + (columnWidth / 2), currentY, { align: 'center' });
            currentX += columnWidth;
          });
          
          currentY += lineHeight;
        });
        
        return currentY;
      };
      
      // Incomes Table
      if (monthlyIncomes.length > 0) {
        // Income section title
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 122, 87); // Green-700
        doc.text('RECEITAS', margin, yPosition);
        yPosition += 8;
        
        // Draw table border
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, yPosition - 8, pageWidth - (margin * 2), monthlyIncomes.length * lineHeight + 15, 'D');
        
        // Income table headers and data
        const tableWidth = pageWidth - (margin * 2);
        const incomeColWidths = [
          tableWidth * 0.25, // Categoria
          tableWidth * 0.15, // Unidade
          tableWidth * 0.20, // Mês Referência
          tableWidth * 0.20, // Data Pagamento
          tableWidth * 0.20  // Valor
        ];
        
        const incomeHeaders = ['Categoria', 'Unidade', 'Mês Referência', 'Data Pagamento', 'Valor'];
        
        yPosition = drawTableHeader(incomeHeaders, incomeColWidths, yPosition, [16, 122, 87]); // Green color for header text
        
        yPosition = drawTableRows(monthlyIncomes, incomeColWidths, yPosition, (income) => [
          getCategoryName(income.category),
          income.unit || "N/A",
          formatReferenceMonth(income.reference_month) || "N/A",
          formatDateToBR(income.payment_date) || "N/A",
          `R$ ${income.amount}`
        ], [16, 122, 87]);
        
        // Total line
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPosition - 2, pageWidth - (margin * 2), 8, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 122, 87); // Green-700
        
        // Draw "Total" text
        doc.text('Total', margin + (incomeColWidths[0] / 2), yPosition + 3, { align: 'center' });
        
        // Draw total amount - centered in the last column
        const totalAmountX = margin + incomeColWidths[0] + incomeColWidths[1] + 
                            incomeColWidths[2] + incomeColWidths[3] + (incomeColWidths[4] / 2);
        doc.text(`R$ ${formatToBRL(getTotalIncome())}`, totalAmountX, yPosition + 3, { align: 'center' });
        
        yPosition += lineHeight * 3;
      } else {
        // Empty income message
        doc.setFillColor(243, 244, 246); // Gray-100
        doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 20, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128); // Gray-500
        doc.text('Nenhuma receita registrada para este mês', pageWidth / 2, yPosition + 10, { align: 'center' });
        
        yPosition += 30;
      }
      
      // Add a new page if needed before expenses
      if (yPosition > 230 && monthlyExpenses.length > 0) {
        doc.addPage();
        yPosition = 20;
        
        doc.setFillColor(59, 130, 246); // Blue brand color
        doc.rect(0, 0, pageWidth, 5, 'F');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.text("www.meuresidencial.com", pageWidth - 15, 10, { align: 'right' });
      }
      
      // Expenses Table
      if (monthlyExpenses.length > 0) {
        // Expense section title
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28); // Red-700
        doc.text('DESPESAS', margin, yPosition);
        yPosition += 8;
        
        // Draw table border
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, yPosition - 8, pageWidth - (margin * 2), monthlyExpenses.length * lineHeight + 15, 'D');
        
        // Expense table headers and data
        const tableWidth = pageWidth - (margin * 2);
        const expenseColWidths = [
          tableWidth * 0.20, // Categoria
          tableWidth * 0.12, // Unidade
          tableWidth * 0.17, // Mês Referência
          tableWidth * 0.17, // Vencimento
          tableWidth * 0.17, // Pagamento
          tableWidth * 0.17  // Valor
        ];
        
        const expenseHeaders = ['Categoria', 'Unidade', 'Mês Referência', 'Vencimento', 'Pagamento', 'Valor'];
        
        yPosition = drawTableHeader(expenseHeaders, expenseColWidths, yPosition, [185, 28, 28]); // Red color for header text
        
        yPosition = drawTableRows(monthlyExpenses, expenseColWidths, yPosition, (expense) => [
          getCategoryName(expense.category),
          expense.unit || "N/A",
          formatReferenceMonth(expense.reference_month) || "N/A",
          formatDateToBR(expense.due_date) || "N/A",
          formatDateToBR(expense.payment_date) || "N/A",
          `R$ ${expense.amount}`
        ], [185, 28, 28]);
        
        // Total line
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPosition - 2, pageWidth - (margin * 2), 8, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28); // Red-700
        
        // Draw "Total" text centered in the first column
        doc.text('Total', margin + (expenseColWidths[0] / 2), yPosition + 3, { align: 'center' });
        
        // Draw total amount - centered in the last column
        const totalAmountX = margin + expenseColWidths[0] + expenseColWidths[1] + 
                            expenseColWidths[2] + expenseColWidths[3] + expenseColWidths[4] + 
                            (expenseColWidths[5] / 2);
        doc.text(`R$ ${formatToBRL(getTotalExpense())}`, totalAmountX, yPosition + 3, { align: 'center' });
      } else {
        // Empty expenses message
        doc.setFillColor(243, 244, 246); // Gray-100
        doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 20, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128); // Gray-500
        doc.text('Nenhuma despesa registrada para este mês', pageWidth / 2, yPosition + 10, { align: 'center' });
      }
      
      // Bottom watermark and footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184); // Slate-400
      
      // Draw footer with subtle background
      doc.setFillColor(246, 249, 252); // Slate-50
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
      
      // Footer text
      doc.text(`Relatório gerado pelo sistema Meu Residencial - www.meuresidencial.com - ${currentDate}`, 
               pageWidth / 2, pageHeight - 5, { align: 'center' });
      
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
