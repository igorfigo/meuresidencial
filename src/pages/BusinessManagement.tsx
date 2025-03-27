import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBusinessExpenses } from '@/hooks/use-business-expenses';
import { format, subMonths, startOfMonth, differenceInCalendarMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatToBRL } from '@/utils/currency';
import { BarChart3, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

// Category display names mapping
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'aluguel': 'Aluguel',
  'servicos-publicos': 'Serviços Públicos',
  'folha-pagamento': 'Folha de Pagamento',
  'impostos': 'Impostos',
  'marketing': 'Marketing',
  'suprimentos': 'Suprimentos',
  'manutencao': 'Manutenção',
  'software-assinaturas': 'Software/Assinaturas',
  'servicos-juridicos': 'Serviços Jurídicos',
  'servicos-contabeis': 'Serviços Contábeis',
  'viagens': 'Viagens',
  'outros': 'Outros'
};

const BusinessManagement: React.FC = () => {
  const { expenses } = useBusinessExpenses();

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Generate monthly expenses data for the last 12 months
  const getLast12MonthsData = () => {
    const today = new Date();
    const monthlyData = [];
    
    // Create an array with the last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStr = format(monthDate, 'MMM/yy', { locale: ptBR });
      
      // Filter expenses for this month
      const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = startOfMonth(expenseDate);
        const currentMonth = startOfMonth(monthDate);
        return differenceInCalendarMonths(expenseMonth, currentMonth) === 0;
      });
      
      const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      monthlyData.push({
        month: monthStr,
        total: total
      });
    }
    
    return monthlyData;
  };

  // Generate category data
  const getCategoryData = () => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      displayName: CATEGORY_DISPLAY_NAMES[name] || name,
      value
    })).sort((a, b) => b.value - a.value);
  };

  const monthlyData = getLast12MonthsData();
  const categoryData = getCategoryData();

  const formatTooltipValue = (value: number) => {
    return formatToBRL(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Business Management</h1>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            Painel de controle financeiro para gestão das despesas empresariais. Acompanhe os gastos por categoria e a evolução mensal.
          </p>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                <CardTitle>Despesa Total</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatToBRL(totalExpenses)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Total de {expenses.length} registros
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                <CardTitle>Despesas por Categoria</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatTooltipValue} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80}
                      tickFormatter={(value) => CATEGORY_DISPLAY_NAMES[value] || value}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatToBRL(value), 'Valor']}
                      labelFormatter={(name) => CATEGORY_DISPLAY_NAMES[name] || name}
                    />
                    <Bar dataKey="value" name="Valor">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                <CardTitle>Evolução de Despesas (Últimos 12 Meses)</CardTitle>
              </div>
              <CardDescription>
                Acompanhe a evolução mensal das despesas empresariais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatTooltipValue} />
                    <Tooltip 
                      formatter={(value: number) => [formatToBRL(value), 'Total']} 
                      labelFormatter={(label) => `Mês: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="total" 
                      name="Despesas" 
                      fill="#6366f1" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessManagement;
