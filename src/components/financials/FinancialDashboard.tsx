
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MessagesSquare, 
  Calendar
} from 'lucide-react';
import { BRLToNumber } from '@/utils/currency';
import { BalanceDisplay } from './BalanceDisplay';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

type MetricCard = {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  color: string;
};

interface FinancialDashboardProps {
  balance: string;
  incomes: any[];
  expenses: any[];
  onBalanceChange: (balance: string) => Promise<void>;
}

export const FinancialDashboard = ({ 
  balance, 
  incomes, 
  expenses, 
  onBalanceChange 
}: FinancialDashboardProps) => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [incomesByCategory, setIncomesByCategory] = useState<any[]>([]);
  const [monthlyTransactions, setMonthlyTransactions] = useState<any[]>([]);
  const [residentsCount, setResidentsCount] = useState(0);
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Process data for charts and metrics
  useEffect(() => {
    const processData = async () => {
      if (!user?.selectedCondominium) return;
      
      setLoadingData(true);
      try {
        // Process expenses by category
        const expenseCategories: Record<string, number> = {};
        expenses.forEach(expense => {
          const amount = BRLToNumber(expense.amount);
          expenseCategories[expense.category] = (expenseCategories[expense.category] || 0) + amount;
        });
        
        const expensesData = Object.entries(expenseCategories).map(([name, value]) => ({
          name: getCategoryLabel(name),
          value
        }));
        setExpensesByCategory(expensesData);
        
        // Process incomes by category
        const incomeCategories: Record<string, number> = {};
        incomes.forEach(income => {
          const amount = BRLToNumber(income.amount);
          incomeCategories[income.category] = (incomeCategories[income.category] || 0) + amount;
        });
        
        const incomesData = Object.entries(incomeCategories).map(([name, value]) => ({
          name: getCategoryLabel(name),
          value
        }));
        setIncomesByCategory(incomesData);
        
        // Process monthly transactions
        const months: Record<string, { month: string, incomes: number, expenses: number }> = {};
        
        // Initialize with last 6 months
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = formatMonthYear(month);
          months[month] = { month: monthName, incomes: 0, expenses: 0 };
        }
        
        // Add income data
        incomes.forEach(income => {
          if (income.reference_month in months) {
            months[income.reference_month].incomes += BRLToNumber(income.amount);
          }
        });
        
        // Add expense data
        expenses.forEach(expense => {
          if (expense.reference_month in months) {
            months[expense.reference_month].expenses += BRLToNumber(expense.amount);
          }
        });
        
        setMonthlyTransactions(Object.values(months));
        
        // Fetch residents count
        const { count: residentsCount } = await supabase
          .from('residents')
          .select('*', { count: 'exact', head: true })
          .eq('matricula', user.selectedCondominium);
        
        setResidentsCount(residentsCount || 0);
        
        // Fetch announcements count
        const { count: announcementsCount } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })
          .eq('matricula', user.selectedCondominium);
        
        setAnnouncementsCount(announcementsCount || 0);
        
        // Generate recent activity (combining the most recent transactions)
        const allTransactions = [
          ...incomes.map(item => ({ 
            ...item, 
            type: 'income', 
            date: item.created_at || new Date().toISOString() 
          })),
          ...expenses.map(item => ({ 
            ...item, 
            type: 'expense', 
            date: item.created_at || new Date().toISOString() 
          }))
        ];
        
        const sortedActivity = allTransactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        
        setRecentActivity(sortedActivity);
      } catch (error) {
        console.error('Error processing dashboard data:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do dashboard',
          variant: 'destructive'
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    processData();
  }, [user?.selectedCondominium, incomes, expenses]);
  
  const getCategoryLabel = (category: string): string => {
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
  };
  
  const formatMonthYear = (monthString: string): string => {
    try {
      const [year, month] = monthString.split('-');
      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];
      
      return `${monthNames[parseInt(month, 10) - 1]}/${year}`;
    } catch {
      return monthString;
    }
  };
  
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  // Calculate metrics
  const totalIncome = incomes.reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);
  
  // Compare with previous month
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const prevMonthKey = currentMonth === 1 
    ? `${currentYear - 1}-12` 
    : `${currentYear}-${String(currentMonth - 1).padStart(2, '0')}`;
  
  const currentMonthIncomes = incomes
    .filter(income => income.reference_month === currentMonthKey)
    .reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
    
  const prevMonthIncomes = incomes
    .filter(income => income.reference_month === prevMonthKey)
    .reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
    
  const currentMonthExpenses = expenses
    .filter(expense => expense.reference_month === currentMonthKey)
    .reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);
    
  const prevMonthExpenses = expenses
    .filter(expense => expense.reference_month === prevMonthKey)
    .reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);
  
  const incomeTrend = prevMonthIncomes === 0 ? 0 : ((currentMonthIncomes - prevMonthIncomes) / prevMonthIncomes) * 100;
  const expenseTrend = prevMonthExpenses === 0 ? 0 : ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100;
  
  const metrics: MetricCard[] = [
    {
      title: 'Receitas Totais',
      value: formatCurrency(totalIncome),
      trend: incomeTrend,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'text-green-500'
    },
    {
      title: 'Despesas Totais',
      value: formatCurrency(totalExpense),
      trend: expenseTrend,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'text-red-500'
    },
    {
      title: 'Moradores',
      value: residentsCount,
      trend: 0,
      icon: <Users className="h-4 w-4" />,
      color: 'text-blue-500'
    },
    {
      title: 'Comunicados',
      value: announcementsCount,
      trend: 0,
      icon: <MessagesSquare className="h-4 w-4" />,
      color: 'text-purple-500'
    }
  ];
  
  // Pie chart colors
  const INCOME_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
  const EXPENSE_COLORS = ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'];
  
  return (
    <div className="space-y-4 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="border-t-4" style={{ borderTopColor: metric.color.replace('text-', 'rgb(') + ')' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-full ${metric.color.replace('text-', 'bg-').replace('500', '100')}`}>
                        {metric.icon}
                      </div>
                      <span className="text-sm font-medium">{metric.title}</span>
                    </div>
                    {metric.trend !== 0 && (
                      <div className={`text-xs flex items-center ${metric.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.trend > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(metric.trend).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold">{metric.value}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Receitas vs Despesas</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyTransactions}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value as number), '']}
                        labelFormatter={(label) => `Mês: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="incomes" name="Receitas" fill="#10b981" />
                      <Bar dataKey="expenses" name="Despesas" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Saldo</CardTitle>
              </CardHeader>
              <CardContent>
                <BalanceDisplay balance={balance} onBalanceChange={onBalanceChange} />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Receitas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incomesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-3">Nenhuma atividade recente</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 py-2 border-b last:border-0">
                      <div className={`p-2 rounded-full ${activity.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {activity.type === 'income' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {getCategoryLabel(activity.category)}
                          {activity.unit && ` - Unidade ${activity.unit}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className={`text-sm font-semibold ${activity.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {activity.type === 'income' ? '+' : '-'} R$ {activity.amount}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyTransactions}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Receitas']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="incomes" 
                      name="Receitas" 
                      stroke="#10b981" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Receitas por Categoria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {incomesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Valor']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-2">Detalhamento por Categoria</h4>
                    <div className="space-y-2">
                      {incomesByCategory.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: INCOME_COLORS[index % INCOME_COLORS.length] }}
                            ></div>
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyTransactions}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Despesas']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      name="Despesas" 
                      stroke="#ef4444" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Valor']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-2">Detalhamento por Categoria</h4>
                    <div className="space-y-2">
                      {expensesByCategory.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                            ></div>
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
