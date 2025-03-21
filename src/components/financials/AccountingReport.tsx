
import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, ArrowDown, ArrowUp, DollarSign } from 'lucide-react';
import { useFinances } from '@/hooks/use-finances';
import { BRLToNumber, formatToBRL } from '@/utils/currency';

// Função auxiliar para gerar meses para seleção
const generateMonthOptions = () => {
  const now = new Date();
  const months = [];
  
  // Gerar os últimos 12 meses
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = format(date, 'yyyy-MM');
    const label = format(date, 'MMMM/yyyy', { locale: ptBR });
    
    months.push({ value, label });
  }
  
  return months;
};

const AccountingReport = () => {
  const { incomes, expenses, balance, isLoading, refreshData } = useFinances();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [monthlyIncomes, setMonthlyIncomes] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [periodBalance, setPeriodBalance] = useState<any>({
    startBalance: '0',
    endBalance: '0',
    totalIncomes: '0',
    totalExpenses: '0',
    result: '0'
  });

  // Carregar os dados mensais quando o mês ou dados financeiros mudarem
  useEffect(() => {
    calculateMonthlyData();
  }, [selectedMonth, incomes, expenses, balance]);

  useEffect(() => {
    refreshData();
  }, []);

  const calculateMonthlyData = () => {
    if (isLoading) return;

    // Filtra as receitas do mês selecionado
    const filteredIncomes = incomes.filter(income => 
      income.reference_month === selectedMonth
    );

    // Filtra as despesas do mês selecionado
    const filteredExpenses = expenses.filter(expense => 
      expense.reference_month === selectedMonth
    );

    // Calcula totais
    const totalIncomesValue = filteredIncomes.reduce((sum, income) => 
      sum + BRLToNumber(income.amount), 0
    );
    
    const totalExpensesValue = filteredExpenses.reduce((sum, expense) => 
      sum + BRLToNumber(expense.amount), 0
    );

    // Saldo atual
    const currentBalanceValue = balance ? BRLToNumber(balance.balance) : 0;
    
    // Saldo no início do mês (estimativa simplificada)
    const startBalanceValue = currentBalanceValue - totalIncomesValue + totalExpensesValue;
    
    // Resultado do período
    const resultValue = totalIncomesValue - totalExpensesValue;

    setPeriodBalance({
      startBalance: formatToBRL(startBalanceValue),
      endBalance: formatToBRL(currentBalanceValue),
      totalIncomes: formatToBRL(totalIncomesValue),
      totalExpenses: formatToBRL(totalExpensesValue),
      result: formatToBRL(resultValue)
    });

    setMonthlyIncomes(filteredIncomes);
    setMonthlyExpenses(filteredExpenses);
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  const handleDownloadReport = () => {
    // Criar nome de arquivo baseado no mês
    const monthName = selectedMonth ? 
      format(parse(selectedMonth, 'yyyy-MM', new Date()), 'MMMM-yyyy', { locale: ptBR }) : 
      'relatorio';
    
    // Preparar dados para CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Cabeçalho
    csvContent += 'Relatório Financeiro - ' + monthName + '\r\n\r\n';
    csvContent += 'Saldo Inicial:,' + periodBalance.startBalance + '\r\n';
    csvContent += 'Saldo Final:,' + periodBalance.endBalance + '\r\n';
    csvContent += 'Total Receitas:,' + periodBalance.totalIncomes + '\r\n';
    csvContent += 'Total Despesas:,' + periodBalance.totalExpenses + '\r\n';
    csvContent += 'Resultado:,' + periodBalance.result + '\r\n\r\n';
    
    // Receitas
    csvContent += 'RECEITAS\r\n';
    csvContent += 'Categoria,Valor,Data,Observações\r\n';
    
    monthlyIncomes.forEach(income => {
      csvContent += `${income.category},${income.amount},${income.payment_date || ''},${income.observations || ''}\r\n`;
    });
    
    csvContent += '\r\nDESPESAS\r\n';
    csvContent += 'Categoria,Valor,Data Vencimento,Data Pagamento,Observações\r\n';
    
    monthlyExpenses.forEach(expense => {
      csvContent += `${expense.category},${expense.amount},${expense.due_date || ''},${expense.payment_date || ''},${expense.observations || ''}\r\n`;
    });
    
    // Criar link para download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prestacao-contas-${monthName}.csv`);
    document.body.appendChild(link);
    
    link.click();
    
    // Limpar
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Prestação de Contas</h2>
        
        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleDownloadReport} className="gap-2">
            <Download className="h-4 w-4" />
            Baixar Relatório
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Início do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodBalance.startBalance}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUp className="mr-2 h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{periodBalance.totalIncomes}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDown className="mr-2 h-4 w-4 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{periodBalance.totalExpenses}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold">{periodBalance.endBalance}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas do Mês</CardTitle>
            <CardDescription>
              Total: {periodBalance.totalIncomes}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyIncomes.length > 0 ? (
              <div className="space-y-4">
                {monthlyIncomes.map((income, index) => (
                  <div key={income.id || index} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{income.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {income.payment_date ? format(new Date(income.payment_date), 'dd/MM/yyyy') : 'Data não informada'}
                      </p>
                    </div>
                    <p className="text-green-600 font-medium">{income.amount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhuma receita registrada no mês selecionado</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Despesas do Mês</CardTitle>
            <CardDescription>
              Total: {periodBalance.totalExpenses}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyExpenses.length > 0 ? (
              <div className="space-y-4">
                {monthlyExpenses.map((expense, index) => (
                  <div key={expense.id || index} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.payment_date 
                          ? `Pago em: ${format(new Date(expense.payment_date), 'dd/MM/yyyy')}`
                          : expense.due_date 
                            ? `Vence em: ${format(new Date(expense.due_date), 'dd/MM/yyyy')}`
                            : 'Data não informada'
                        }
                      </p>
                    </div>
                    <p className="text-red-600 font-medium">{expense.amount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhuma despesa registrada no mês selecionado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingReport;
