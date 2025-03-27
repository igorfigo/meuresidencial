
import React, { useState } from 'react';
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
import { BarChart3, DollarSign, PieChartIcon, Users, UserX } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

// Category display names mapping
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
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isStateDetailOpen, setIsStateDetailOpen] = useState(false);

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
    }));
  };

  const [stats, setStats] = useState({
    activeManagers: 0,
    inactiveManagers: 0,
    invoicePreference: 0,
    locationStats: {
      states: [] as [string, number][],
      cities: {} as Record<string, [string, number][]>,
      neighborhoods: [] as [string, number][]
    }
  });

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { count: activeCount, error: activeError } = await supabase
        .from('condominiums')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);
      
      if (activeError) throw activeError;
      
      const { count: inactiveCount, error: inactiveError } = await supabase
        .from('condominiums')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', false);
      
      if (inactiveError) throw inactiveError;
      
      const { count: invoiceCount, error: invoiceError } = await supabase
        .from('condominiums')
        .select('*', { count: 'exact', head: true })
        .eq('tipodocumento', 'notaFiscal');
      
      if (invoiceError) throw invoiceError;
      
      const { data: locationData, error: locationError } = await supabase
        .from('condominiums')
        .select('estado, cidade, bairro');
      
      if (locationError) throw locationError;
      
      const stateCount: Record<string, number> = {};
      const cityByState: Record<string, Record<string, number>> = {};
      const neighborhoodCount: Record<string, number> = {};
      
      locationData.forEach(item => {
        if (item.estado) {
          stateCount[item.estado] = (stateCount[item.estado] || 0) + 1;
          
          if (item.cidade) {
            if (!cityByState[item.estado]) {
              cityByState[item.estado] = {};
            }
            cityByState[item.estado][item.cidade] = (cityByState[item.estado][item.cidade] || 0) + 1;
          }
        }
        
        if (item.bairro) {
          neighborhoodCount[item.bairro] = (neighborhoodCount[item.bairro] || 0) + 1;
        }
      });
      
      const topStates = Object.entries(stateCount)
        .sort((a, b) => b[1] - a[1]);
          
      const citiesByState: Record<string, [string, number][]> = {};
      Object.entries(cityByState).forEach(([state, cities]) => {
        citiesByState[state] = Object.entries(cities).sort((a, b) => b[1] - a[1]);
      });
      
      const topNeighborhoods = Object.entries(neighborhoodCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      setStats({
        activeManagers: activeCount || 0,
        inactiveManagers: inactiveCount || 0,
        invoicePreference: invoiceCount || 0,
        locationStats: {
          states: topStates,
          cities: citiesByState,
          neighborhoods: topNeighborhoods
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  const monthlyData = getLast12MonthsData();
  const categoryData = getCategoryData();

  const formatTooltipValue = (value: number) => {
    return formatToBRL(value);
  };

  const handleStateClick = (state: string) => {
    setSelectedState(state);
    setIsStateDetailOpen(true);
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-blue-500" />
                <CardTitle>Despesas por Categoria</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ displayName, percent }) => 
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
            </CardContent>
          </Card>

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

      <Sheet open={isStateDetailOpen} onOpenChange={setIsStateDetailOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Cidades em {selectedState}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedState && stats.locationStats.cities[selectedState] ? (
              <ul className="space-y-2">
                {stats.locationStats.cities[selectedState].map(([city, count]) => (
                  <li key={city} className="flex justify-between items-center py-2 border-b">
                    <span>{city}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Sem dados de cidades para este estado.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default BusinessManagement;
