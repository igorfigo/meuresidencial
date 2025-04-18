
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ExpenseEvolutionChart } from '@/components/financials/ExpenseEvolutionChart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBusinessExpenses } from '@/hooks/use-business-expenses';
import { format, subMonths, startOfMonth, differenceInCalendarMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatToBRL } from '@/utils/currency';
import { BarChart3, DollarSign, PieChartIcon, InfoIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useApp } from '@/contexts/AppContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'aluguel': 'Aluguel',
  'servicos-contabeis': 'Serviços Contábeis',
  'folha-pagamento': 'Folha de Pagamento',
  'impostos': 'Impostos',
  'marketing': 'Marketing',
  'tecnologia': 'Tecnologia',
  'materiais': 'Materiais',
  'servicos-terceirizados': 'Serviços Terceirizados',
  'despesas-administrativas': 'Despesas Administrativas',
  'outros': 'Outros'
};

const BusinessManagement: React.FC = () => {
  const { expenses } = useBusinessExpenses();
  const isMobile = useIsMobile();
  const { user } = useApp();

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getLast12MonthsData = () => {
    const today = new Date();
    const monthlyData = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStr = format(monthDate, 'MMM/yy', { locale: ptBR });
      
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
    }));
  };

  const monthlyData = getLast12MonthsData();
  const categoryData = getCategoryData();

  const formatTooltipValue = (value: number) => {
    return formatToBRL(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 p-3 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Business Management</h1>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-sm md:text-base">
            Painel de controle financeiro para gestão das despesas empresariais. Acompanhe os gastos por categoria e a evolução mensal.
          </p>
        </div>
        
        <Separator className="my-2 md:my-4" />
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card className="border-t-4 border-t-brand-600 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                  <CardTitle className="text-lg md:text-xl">Despesa Total</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-28 md:h-40">
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-blue-600">
                      {formatToBRL(totalExpenses)}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 mt-2">
                      Total de {expenses.length} registros
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-brand-600 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-blue-500" />
                    <CardTitle className="text-lg md:text-xl">Despesas por Categoria</CardTitle>
                  </div>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1 cursor-help">
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs w-[200px]">Toque nas categorias no gráfico para visualizar detalhes</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className={isMobile ? "h-52" : "h-60"}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={isMobile ? 60 : 80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ displayName, percent }) => 
                          isMobile ? 
                            `${displayName}: ${(percent * 100).toFixed(0)}%` :
                            `${displayName}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatToBRL(value)}
                        labelFormatter={(name) => {
                          const item = categoryData.find(c => c.name === name);
                          return item?.displayName || name;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {isMobile && (
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="flex items-center text-[10px] md:text-xs">
                        <div 
                          className="w-2 h-2 md:w-3 md:h-3 mr-1 rounded-sm" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate">{category.displayName}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!isMobile && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="flex items-center text-xs">
                        <div 
                          className="w-3 h-3 mr-1 rounded-sm" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate">{category.displayName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <ExpenseEvolutionChart matricula={user?.matricula || ''} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BusinessManagement;
