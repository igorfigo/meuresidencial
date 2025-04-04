
import { useState, useEffect } from 'react';
import { format, parse, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { FileDown, ChevronRight, ChevronDown } from 'lucide-react';
import { useFinances } from '@/hooks/use-finances';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import { useApp } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
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
      const correctedDate = addDays(date, 1);
      return format(correctedDate, 'dd/MM/yyyy');
    }
    
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const correctedDate = addDays(date, 1);
    return format(correctedDate, 'dd/MM/yyyy');
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
  const [showIncomes, setShowIncomes] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);
  const isMobile = useIsMobile();
  
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
      doc.setFontSize(11);
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;
      const lineHeight = 7;
      const margin = 15;
      
      doc.setFillColor(33, 81, 185);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setFillColor(33, 81, 185);
      doc.rect(0, 0, pageWidth, 5, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("TRANSPARÊNCIA E GESTÃO EFICIENTE", pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 1.5;
      
      doc.setFontSize(10);
      doc.text("Demonstrativo mensal de receitas e despesas para acompanhamento dos moradores", pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 1.5;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      const title = `Prestação de Contas - ${monthName} ${year}`;
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2.5;
      
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
        if (user.cidade) addressParts.push(user.cidade);
        if (user.estado) addressParts.push(user.estado);
        
        if (addressParts.length > 0) {
          addressText = addressParts.join(', ');
        }
      }
      
      doc.text(`Endereço: ${addressText}`, pageWidth / 2, yPosition + 25, { align: 'center' });
      
      yPosition += lineHeight * 6;
      
      doc.setFillColor(243, 250, 247);
      doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 42, 3, 3, 'F');
      
      doc.setFillColor(41, 90, 195);
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
      doc.setTextColor(33, 81, 185);
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
          doc.text(header, currentX + (columnWidths[i] / 2), y - 1, { align: 'center' });
          currentX += columnWidths[i];
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
            
            doc.setFillColor(33, 81, 185);
            doc.rect(0, 0, pageWidth, 5, 'F');
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(41, 90, 195);
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
        
        doc.setFillColor(33, 81, 185);
        doc.rect(0, 0, pageWidth, 5, 'F');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(41, 90, 195);
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
      doc.setTextColor(255, 255, 255);
      
      doc.setFillColor(33, 81, 185);
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
      
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
    <Card className="mb-8 border-t-4 border-t-brand-600">
      <CardContent className={`${isMobile ? 'p-2' : 'pt-6'}`}>
        <div className="flex flex-col space-y-4 mb-4">
          <div className="w-full">
            <Label htmlFor="month" className={`mb-1 block ${isMobile ? 'text-sm' : ''}`}>Mês de Referência</Label>
            <div className="flex gap-2">
              <Select value={selectedMonth} onValueChange={handleMonthChange} className="flex-1">
                <SelectTrigger id="month" className={isMobile ? "h-8 text-sm" : ""}>
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
              
              <Button 
                onClick={generatePDF} 
                disabled={isGenerating || (monthlyIncomes.length === 0 && monthlyExpenses.length === 0)}
                className={`flex items-center gap-2 ${isMobile ? 'h-8 text-xs px-2 py-1' : ''}`}
                variant="outline"
              >
                <FileDown size={isMobile ? 14 : 16} />
                {isGenerating ? 'Gerando...' : isMobile ? 'PDF' : 'Baixar Relatório PDF'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 mb-4">
          <Card>
            <CardContent className={`${isMobile ? 'p-2 pt-3' : 'pt-4'}`}>
              <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'} mb-2`}>Resumo do Mês</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <div className="flex flex-col py-1 border-b">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Saldo Inicial:</span>
                    <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>R$ {startBalance}</span>
                  </div>
                  <div className="flex flex-col py-1 border-b">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Total Receitas:</span>
                    <span className={`font-medium text-green-600 ${isMobile ? 'text-sm' : ''}`}>
                      + R$ {formatToBRL(getTotalIncome())}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-col py-1 border-b">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Saldo Final:</span>
                    <span className={`font-bold text-brand-600 ${isMobile ? 'text-sm' : ''}`}>R$ {endBalance}</span>
                  </div>
                  <div className="flex flex-col py-1 border-b">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Total Despesas:</span>
                    <span className={`font-medium text-red-600 ${isMobile ? 'text-sm' : ''}`}>
                      - R$ {formatToBRL(getTotalExpense())}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`flex justify-between items-center pt-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <span className="text-gray-600">Resultado do Mês:</span>
                <span className={`font-medium ${getTotalIncome() - getTotalExpense() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {formatToBRL(getTotalIncome() - getTotalExpense())}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          {/* Receitas Section with collapsible header */}
          <div className="border rounded-lg overflow-hidden">
            <div 
              className={`flex justify-between items-center p-3 bg-gray-50 cursor-pointer ${isMobile ? 'text-sm' : ''}`}
              onClick={() => setShowIncomes(!showIncomes)}
            >
              <h3 className="font-medium flex items-center">
                {showIncomes ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
                Receitas do Mês
              </h3>
              <span className="text-green-600 font-medium">R$ {formatToBRL(getTotalIncome())}</span>
            </div>
            
            {showIncomes && (
              <div>
                {monthlyIncomes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className={isMobile ? "text-xs" : ""}>Categoria</TableHead>
                          {!isMobile && <TableHead>Unidade</TableHead>}
                          {!isMobile && <TableHead>Mês Ref.</TableHead>}
                          <TableHead className={isMobile ? "text-xs" : ""}>Data</TableHead>
                          <TableHead className={`text-right ${isMobile ? "text-xs" : ""}`}>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyIncomes.map(income => (
                          <TableRow key={income.id}>
                            <TableCell className={`font-medium ${isMobile ? "text-xs py-1 whitespace-nowrap" : ""}`}>
                              {getCategoryName(income.category)}
                            </TableCell>
                            {!isMobile && <TableCell>{income.unit || '-'}</TableCell>}
                            {!isMobile && <TableCell>{formatReferenceMonth(income.reference_month) || '-'}</TableCell>}
                            <TableCell className={isMobile ? "text-xs py-1" : ""}>
                              {formatDateToBR(income.payment_date) || '-'}
                            </TableCell>
                            <TableCell className={`text-right text-green-600 ${isMobile ? "text-xs py-1" : ""}`}>
                              R$ {income.amount}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={isMobile ? 2 : 4} className={`font-bold ${isMobile ? "text-xs" : ""}`}>Total</TableCell>
                          <TableCell className={`text-right font-bold text-green-600 ${isMobile ? "text-xs" : ""}`}>
                            R$ {formatToBRL(getTotalIncome())}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className={`text-center py-4 bg-gray-50 ${isMobile ? "text-xs" : ""}`}>
                    <p className="text-gray-500">Nenhuma receita registrada para este mês</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Despesas Section with collapsible header */}
          <div className="border rounded-lg overflow-hidden">
            <div 
              className={`flex justify-between items-center p-3 bg-gray-50 cursor-pointer ${isMobile ? 'text-sm' : ''}`}
              onClick={() => setShowExpenses(!showExpenses)}
            >
              <h3 className="font-medium flex items-center">
                {showExpenses ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
                Despesas do Mês
              </h3>
              <span className="text-red-600 font-medium">R$ {formatToBRL(getTotalExpense())}</span>
            </div>
            
            {showExpenses && (
              <div>
                {monthlyExpenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className={isMobile ? "text-xs" : ""}>Categoria</TableHead>
                          {!isMobile && <TableHead>Unidade</TableHead>}
                          {!isMobile && <TableHead>Mês Ref.</TableHead>}
                          {!isMobile && <TableHead>Vencimento</TableHead>}
                          <TableHead className={isMobile ? "text-xs" : ""}>Pagamento</TableHead>
                          <TableHead className={`text-right ${isMobile ? "text-xs" : ""}`}>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyExpenses.map(expense => (
                          <TableRow key={expense.id}>
                            <TableCell className={`font-medium ${isMobile ? "text-xs py-1 whitespace-nowrap" : ""}`}>
                              {getCategoryName(expense.category)}
                            </TableCell>
                            {!isMobile && <TableCell>{expense.unit || '-'}</TableCell>}
                            {!isMobile && <TableCell>{formatReferenceMonth(expense.reference_month) || '-'}</TableCell>}
                            {!isMobile && <TableCell>{formatDateToBR(expense.due_date) || '-'}</TableCell>}
                            <TableCell className={isMobile ? "text-xs py-1" : ""}>
                              {formatDateToBR(expense.payment_date) || '-'}
                            </TableCell>
                            <TableCell className={`text-right text-red-600 ${isMobile ? "text-xs py-1" : ""}`}>
                              R$ {expense.amount}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={isMobile ? 2 : 5} className={`font-bold ${isMobile ? "text-xs" : ""}`}>Total</TableCell>
                          <TableCell className={`text-right font-bold text-red-600 ${isMobile ? "text-xs" : ""}`}>
                            R$ {formatToBRL(getTotalExpense())}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className={`text-center py-4 bg-gray-50 ${isMobile ? "text-xs" : ""}`}>
                    <p className="text-gray-500">Nenhuma despesa registrada para este mês</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
