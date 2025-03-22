
import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { FileDown, Mail } from 'lucide-react';
import { useFinances } from '@/hooks/use-finances';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import { useApp } from '@/contexts/AppContext';
import jsPDF from 'jspdf';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
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
      
      doc.setFillColor(244, 247, 254);
      doc.roundedRect(margin, yPosition - 5, pageWidth - (margin * 2), 35, 3, 3, 'F');
      
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
      doc.save(fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateReportHtml = () => {
    const [year, month] = selectedMonth.split('-');
    const monthDate = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = monthDate.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
    const currentDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    
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
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Prestação de Contas - ${monthName} ${year}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.5;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            padding: 20px 0;
            border-bottom: 2px solid #3b82f6;
            margin-bottom: 20px;
          }
          .header h1 {
            text-align: center;
            margin: 5px 0;
            color: #1f2937;
          }
          .info-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .summary-box {
            background-color: #f0fdf4;
            border: 1px solid #d1fae5;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .summary-title {
            background-color: #2d7a80;
            color: white;
            padding: 8px;
            text-align: center;
            margin: -15px -15px 15px -15px;
            border-radius: 5px 5px 0 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: left;
            border: 1px solid #e5e7eb;
          }
          td {
            padding: 8px 10px;
            border: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .income th {
            color: #166534;
          }
          .expense th {
            color: #b91c1c;
          }
          .total-row {
            font-weight: bold;
          }
          .income .amount {
            color: #166534;
          }
          .expense .amount {
            color: #b91c1c;
          }
          .footer {
            font-size: 0.8em;
            text-align: center;
            color: #6b7280;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Prestação de Contas - ${monthName} ${year}</h1>
          <p style="text-align: center;">Relatório gerado em: ${currentDate}</p>
        </div>
        
        <div class="info-box">
          <h2>Informações do Condomínio</h2>
          <p><strong>Condomínio:</strong> ${user?.nomeCondominio || "Nome não disponível"}</p>
          <p><strong>Matrícula:</strong> ${user?.selectedCondominium || "Não disponível"}</p>
          <p><strong>Endereço:</strong> ${addressText}</p>
        </div>
        
        <div class="summary-box">
          <div class="summary-title">RESUMO FINANCEIRO</div>
          <p><strong>Saldo Inicial:</strong> R$ ${startBalance}</p>
          <p style="color: #166534;"><strong>Total de Receitas:</strong> R$ ${formatToBRL(getTotalIncome())}</p>
          <p style="color: #b91c1c;"><strong>Total de Despesas:</strong> R$ ${formatToBRL(getTotalExpense())}</p>
          <p><strong>Saldo Final:</strong> R$ ${endBalance}</p>
        </div>
        
        <h2>RECEITAS</h2>
        ${monthlyIncomes.length > 0 ? `
        <table class="income">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Unidade</th>
              <th>Mês Referência</th>
              <th>Data Pagamento</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyIncomes.map(income => `
            <tr>
              <td>${getCategoryName(income.category)}</td>
              <td>${income.unit || '-'}</td>
              <td>${formatReferenceMonth(income.reference_month) || '-'}</td>
              <td>${formatDateToBR(income.payment_date) || '-'}</td>
              <td class="amount">R$ ${income.amount}</td>
            </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4">Total</td>
              <td class="amount">R$ ${formatToBRL(getTotalIncome())}</td>
            </tr>
          </tbody>
        </table>
        ` : '<p>Nenhuma receita registrada para este mês</p>'}
        
        <h2>DESPESAS</h2>
        ${monthlyExpenses.length > 0 ? `
        <table class="expense">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Unidade</th>
              <th>Mês Referência</th>
              <th>Vencimento</th>
              <th>Data Pagamento</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyExpenses.map(expense => `
            <tr>
              <td>${getCategoryName(expense.category)}</td>
              <td>${expense.unit || '-'}</td>
              <td>${formatReferenceMonth(expense.reference_month) || '-'}</td>
              <td>${formatDateToBR(expense.due_date) || '-'}</td>
              <td>${formatDateToBR(expense.payment_date) || '-'}</td>
              <td class="amount">R$ ${expense.amount}</td>
            </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="5">Total</td>
              <td class="amount">R$ ${formatToBRL(getTotalExpense())}</td>
            </tr>
          </tbody>
        </table>
        ` : '<p>Nenhuma despesa registrada para este mês</p>'}
        
        <div class="footer">
          <p>Relatório gerado pelo sistema Meu Residencial - www.meuresidencial.com - ${currentDate}</p>
        </div>
      </body>
      </html>
    `;
  };
  
  const handleSendReport = async () => {
    setShowSendDialog(false);
    setShowConfirmDialog(false);
    
    if (!sendViaEmail && !sendViaWhatsapp) {
      toast({
        title: "Selecione pelo menos um método de envio",
        description: "Escolha entre e-mail ou WhatsApp para enviar o relatório.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const [year, month] = selectedMonth.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1);
      const monthLabel = format(monthDate, 'MMMM yyyy', { locale: ptBR });
      
      if (sendViaEmail) {
        const reportHtml = generateReportHtml();
        
        const response = await supabase.functions.invoke('send-accounting-report', {
          body: {
            matricula: user?.selectedCondominium,
            month: selectedMonth,
            reportHtml,
            monthLabel,
            condominiumName: user?.nomeCondominio || "Seu Condomínio"
          }
        });
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        if (response.data.success) {
          toast({
            title: "Relatório enviado com sucesso!",
            description: response.data.message,
          });
        } else {
          throw new Error(response.data.error || "Erro ao enviar relatório");
        }
      }
      
      if (sendViaWhatsapp) {
        toast({
          title: "Envio por WhatsApp",
          description: "O envio por WhatsApp ainda não está disponível nesta versão.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      toast({
        title: "Erro ao enviar relatório",
        description: error.message || "Ocorreu um erro ao enviar o relatório.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
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
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowSendDialog(true)} 
              disabled={isSending || (monthlyIncomes.length === 0 && monthlyExpenses.length === 0)}
              className="flex items-center gap-2"
              variant="secondary"
            >
              <Mail size={16} />
              Prestar Contas aos Moradores
            </Button>
            
            <Button 
              onClick={generatePDF} 
              disabled={isGenerating || (monthlyIncomes.length === 0 && monthlyExpenses.length === 0)}
              className="flex items-center gap-2"
            >
              <FileDown size={16} />
              {isGenerating ? 'Gerando...' : 'Baixar Relatório PDF'}
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
      
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prestar Contas aos Moradores</DialogTitle>
            <DialogDescription>
              Envie o relatório de prestação de contas para todos os moradores do condomínio via e-mail ou WhatsApp.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sendEmail" 
                checked={sendViaEmail} 
                onCheckedChange={(checked) => setSendViaEmail(checked === true)} 
              />
              <Label htmlFor="sendEmail">Enviar via E-mail</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sendWhatsapp" 
                checked={sendViaWhatsapp} 
                onCheckedChange={(checked) => setSendViaWhatsapp(checked === true)} 
              />
              <Label htmlFor="sendWhatsapp">Enviar via WhatsApp</Label>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowSendDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={() => setShowConfirmDialog(true)}
              disabled={!sendViaEmail && !sendViaWhatsapp}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar envio do relatório?</AlertDialogTitle>
            <AlertDialogDescription>
              O relatório de prestação de contas será enviado para todos os moradores cadastrados
              {sendViaEmail && sendViaWhatsapp 
                ? ' via e-mail e WhatsApp' 
                : sendViaEmail 
                  ? ' via e-mail' 
                  : ' via WhatsApp'
              }.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendReport}
              disabled={isSending}
            >
              {isSending ? 'Enviando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
