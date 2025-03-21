
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Wallet, Calculator, PieChart as PieChartIcon } from 'lucide-react';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import { FinancialIncome, FinancialExpense } from '@/hooks/use-finances';

interface DashboardCardsProps {
  incomes: FinancialIncome[];
  expenses: FinancialExpense[];
  balance: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const DashboardCards: React.FC<DashboardCardsProps> = ({ incomes, expenses, balance }) => {
  // Process data for charts
  const totalIncome = incomes.reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);
  const balanceValue = BRLToNumber(balance);
  
  // Group incomes by category
  const incomesByCategory = incomes.reduce((acc, income) => {
    const category = income.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += BRLToNumber(income.amount);
    return acc;
  }, {} as Record<string, number>);
  
  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += BRLToNumber(expense.amount);
    return acc;
  }, {} as Record<string, number>);
  
  // Format category data for pie charts
  const incomePieData = Object.entries(incomesByCategory).map(([name, value]) => ({
    name: getCategoryLabel(name),
    value
  }));
  
  const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name: getCategoryLabel(name),
    value
  }));
  
  // Format data for monthly bar chart
  const monthlyData = getMonthlyData(incomes, expenses);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Balance Card */}
      <Card className="border-t-4 border-t-brand-600 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Saldo Total</CardTitle>
          <CardDescription>Saldo atual do condomínio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Wallet className="h-12 w-12 text-brand-600" />
            <div className="text-right">
              <p className={`text-2xl font-bold ${balanceValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {balanceValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                Atualizado em {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Income Card */}
      <Card className="border-t-4 border-t-brand-600 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Total de Receitas</CardTitle>
          <CardDescription>Todas as receitas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <ArrowUpCircle className="h-12 w-12 text-green-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {totalIncome.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {incomes.length} registros de receitas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Expenses Card */}
      <Card className="border-t-4 border-t-brand-600 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Total de Despesas</CardTitle>
          <CardDescription>Todas as despesas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <ArrowDownCircle className="h-12 w-12 text-red-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">
                {totalExpense.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {expenses.length} registros de despesas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Income by Category Card */}
      <Card className="border-t-4 border-t-brand-600 shadow-md md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Receitas por Categoria</CardTitle>
          <CardDescription>Distribuição de receitas</CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-80">
            <ChartContainer
              config={{
                income: { color: '#22c55e' }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {incomePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-medium">{payload[0].name}</span>
                              <span className="font-medium">
                                {Number(payload[0].value).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Expenses by Category Card */}
      <Card className="border-t-4 border-t-brand-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Despesas por Categoria</CardTitle>
          <CardDescription>Distribuição de despesas</CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-80">
            <ChartContainer
              config={{
                expense: { color: '#ef4444' }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-medium">{payload[0].name}</span>
                              <span className="font-medium">
                                {Number(payload[0].value).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Monthly Comparison Card */}
      <Card className="border-t-4 border-t-brand-600 shadow-md col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Comparativo Mensal</CardTitle>
          <CardDescription>Receitas e despesas por mês</CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-80">
            <ChartContainer
              config={{
                income: { color: '#22c55e' },
                expense: { color: '#ef4444' }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-medium mb-2">{label}</div>
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-green-600 font-medium">Receitas:</span>
                              <span className="font-medium">
                                {Number(payload[0].value).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </span>
                              <span className="text-red-600 font-medium">Despesas:</span>
                              <span className="font-medium">
                                {Number(payload[1].value).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Receitas" fill="#22c55e" />
                  <Bar dataKey="expense" name="Despesas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get category label
function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    'taxa_condominio': 'Taxa de Condomínio',
    'reserva_area_comum': 'Reserva Área Comum',
    'taxa_extra': 'Taxa Extra',
    
    'energia': 'Energia',
    'agua': 'Água',
    'manutencao': 'Manutenção',
    'gas': 'Gás',
    'limpeza': 'Limpeza',
    'produtos': 'Produtos',
    'imposto': 'Imposto',
    'seguranca': 'Segurança',
    'sistema_condominio': 'Sistema Condomínio',
    
    'outros': 'Outros'
  };
  
  return categoryMap[category] || category;
}

// Function to process monthly data
function getMonthlyData(incomes: FinancialIncome[], expenses: FinancialExpense[]) {
  // Get all unique months from both incomes and expenses
  const months = new Set<string>();
  
  incomes.forEach(income => {
    if (income.reference_month) {
      months.add(income.reference_month);
    }
  });
  
  expenses.forEach(expense => {
    if (expense.reference_month) {
      months.add(expense.reference_month);
    }
  });
  
  // Sort months chronologically
  const sortedMonths = Array.from(months).sort();
  
  // Create data for each month
  return sortedMonths.map(monthYear => {
    const [year, month] = monthYear.split('-');
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    const monthLabel = `${monthNames[parseInt(month, 10) - 1]}/${year}`;
    
    const monthlyIncomeTotal = incomes
      .filter(income => income.reference_month === monthYear)
      .reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
    
    const monthlyExpenseTotal = expenses
      .filter(expense => expense.reference_month === monthYear)
      .reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);
    
    return {
      month: monthLabel,
      income: monthlyIncomeTotal,
      expense: monthlyExpenseTotal,
      balance: monthlyIncomeTotal - monthlyExpenseTotal
    };
  });
}
