
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { BalanceDisplay } from '@/components/financials/BalanceDisplay';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatToBRL, BRLToNumber } from '@/utils/currency';
import { Calendar, Wallet, Home, PieChart, AlertCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';

const FinanceiroDashboard = () => {
  const { user } = useApp();
  const [balance, setBalance] = useState('0,00');
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [unitStatusData, setUnitStatusData] = useState<any[]>([]);
  const [revenueDistributionData, setRevenueDistributionData] = useState<any[]>([]);
  const [pendingRevenueData, setPendingRevenueData] = useState<any>({});
  const [paymentStatusData, setPaymentStatusData] = useState<any[]>([]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a163be', '#61dafb', '#f97150', '#4db35e'];
  const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  useEffect(() => {
    if (user?.selectedCondominium) {
      fetchFinancialData();
    }
  }, [user?.selectedCondominium]);
  
  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      
      await Promise.all([
        fetchBalance(),
        fetchMonthlyData(),
        fetchUnitPaymentStatus(),
        fetchRevenueDistribution(),
        fetchPendingRevenue(),
        fetchAnnualPaymentStatus()
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard financeiro');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_balance')
        .select('balance')
        .eq('matricula', user?.selectedCondominium)
        .single();
      
      if (error) throw error;
      
      setBalance(data?.balance || '0,00');
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0,00');
    }
  };
  
  const fetchMonthlyData = async () => {
    try {
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 5);
      
      const months = [];
      for (let i = 0; i < 6; i++) {
        const month = new Date(sixMonthsAgo);
        month.setMonth(sixMonthsAgo.getMonth() + i);
        months.push(format(month, 'yyyy-MM', { locale: ptBR }));
      }
      
      const { data: incomes, error: incomesError } = await supabase
        .from('financial_incomes')
        .select('amount, reference_month')
        .eq('matricula', user?.selectedCondominium);
      
      if (incomesError) throw incomesError;
      
      const { data: expenses, error: expensesError } = await supabase
        .from('financial_expenses')
        .select('amount, reference_month')
        .eq('matricula', user?.selectedCondominium);
      
      if (expensesError) throw expensesError;
      
      const monthlyStats = months.map(month => {
        const monthlyIncomes = incomes.filter(income => income.reference_month === month);
        const monthlyExpenses = expenses.filter(expense => expense.reference_month === month);
        
        const totalIncome = monthlyIncomes.reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
        const totalExpense = monthlyExpenses.reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);
        
        const [year, monthNum] = month.split('-');
        const monthName = MONTHS[parseInt(monthNum) - 1];
        
        return {
          month: `${monthName.substring(0, 3)}/${year.substring(2)}`,
          receita: totalIncome,
          despesa: totalExpense,
        };
      });
      
      setMonthlyData(monthlyStats);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setMonthlyData([]);
    }
  };
  
  const fetchUnitPaymentStatus = async () => {
    try {
      const today = new Date();
      const currentMonth = format(today, 'yyyy-MM', { locale: ptBR });
      
      const { data: residents, error: residentsError } = await supabase
        .from('residents')
        .select('id, unidade')
        .eq('matricula', user?.selectedCondominium);
      
      if (residentsError) throw residentsError;
      
      const { data: paidUnits, error: paidUnitsError } = await supabase
        .from('financial_incomes')
        .select('unit')
        .eq('matricula', user?.selectedCondominium)
        .eq('category', 'taxa_condominio')
        .eq('reference_month', currentMonth);
      
      if (paidUnitsError) throw paidUnitsError;
      
      const totalUnits = residents.length;
      
      const paidUnitNames = new Set(paidUnits.map(item => item.unit).filter(Boolean));
      const paidUnitsCount = paidUnitNames.size;
      
      const unpaidUnits = totalUnits - paidUnitsCount;
      
      setUnitStatusData([
        { name: 'Pagas', value: paidUnitsCount },
        { name: 'Pendentes', value: unpaidUnits }
      ]);
    } catch (error) {
      console.error('Error fetching unit payment status:', error);
      setUnitStatusData([]);
    }
  };
  
  const fetchRevenueDistribution = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_incomes')
        .select('amount, category')
        .eq('matricula', user?.selectedCondominium);
      
      if (error) throw error;
      
      const categories: Record<string, number> = {};
      
      data.forEach(income => {
        const category = income.category || 'Outros';
        const amount = BRLToNumber(income.amount);
        
        if (categories[category]) {
          categories[category] += amount;
        } else {
          categories[category] = amount;
        }
      });
      
      const chartData = Object.entries(categories).map(([name, value]) => ({
        name,
        value
      }));
      
      setRevenueDistributionData(chartData);
    } catch (error) {
      console.error('Error fetching revenue distribution:', error);
      setRevenueDistributionData([]);
    }
  };
  
  const fetchPendingRevenue = async () => {
    try {
      const today = new Date();
      const currentMonth = format(today, 'yyyy-MM', { locale: ptBR });
      
      const { data: residents, error: residentsError } = await supabase
        .from('residents')
        .select('unidade, valor_condominio')
        .eq('matricula', user?.selectedCondominium);
      
      if (residentsError) throw residentsError;
      
      const { data: paidUnits, error: paidUnitsError } = await supabase
        .from('financial_incomes')
        .select('unit, amount')
        .eq('matricula', user?.selectedCondominium)
        .eq('category', 'taxa_condominio')
        .eq('reference_month', currentMonth);
      
      if (paidUnitsError) throw paidUnitsError;
      
      const paidUnitMap = new Map();
      paidUnits.forEach(item => {
        if (item.unit) {
          paidUnitMap.set(item.unit, BRLToNumber(item.amount));
        }
      });
      
      let totalExpected = 0;
      let totalReceived = 0;
      let pendingUnits = 0;
      
      residents.forEach(resident => {
        const fee = BRLToNumber(resident.valor_condominio || '0');
        totalExpected += fee;
        
        if (paidUnitMap.has(resident.unidade)) {
          totalReceived += paidUnitMap.get(resident.unidade);
        } else {
          pendingUnits++;
        }
      });
      
      const pendingAmount = totalExpected - totalReceived;
      
      setPendingRevenueData({
        pendingAmount,
        pendingUnits,
        totalExpected
      });
    } catch (error) {
      console.error('Error fetching pending revenue:', error);
      setPendingRevenueData({});
    }
  };
  
  const fetchAnnualPaymentStatus = async () => {
    try {
      const today = new Date();
      
      // Get the last 6 months
      const last6Months = [];
      for (let i = 0; i < 6; i++) {
        const month = new Date();
        month.setMonth(today.getMonth() - i);
        
        const yearMonth = format(month, 'yyyy-MM', { locale: ptBR });
        last6Months.unshift(yearMonth); // Add to beginning so they're in chronological order
      }
      
      const { data: residents, error: residentsError } = await supabase
        .from('residents')
        .select('unidade')
        .eq('matricula', user?.selectedCondominium);
      
      if (residentsError) throw residentsError;
      
      // Get all payment records for the last 6 months
      const { data: payments, error: paymentsError } = await supabase
        .from('financial_incomes')
        .select('unit, reference_month')
        .eq('matricula', user?.selectedCondominium)
        .eq('category', 'taxa_condominio')
        .in('reference_month', last6Months);
      
      if (paymentsError) throw paymentsError;
      
      const statusData = residents.map(resident => {
        const unitPayments = payments
          .filter(payment => payment.unit === resident.unidade)
          .map(payment => payment.reference_month);
        
        const monthlyStatus = {};
        last6Months.forEach(yearMonth => {
          const [year, month] = yearMonth.split('-');
          const monthIndex = parseInt(month) - 1;
          const monthKey = `month${monthIndex + 1}`;
          monthlyStatus[monthKey] = unitPayments.includes(yearMonth) ? 'paid' : 'unpaid';
        });
        
        return {
          unit: resident.unidade,
          ...monthlyStatus
        };
      });
      
      setPaymentStatusData(statusData);
    } catch (error) {
      console.error('Error fetching annual payment status:', error);
      setPaymentStatusData([]);
    }
  };
  
  const handleBalanceChange = async (newBalance: string) => {
    try {
      const { error } = await supabase
        .from('financial_balance')
        .upsert(
          { 
            matricula: user?.selectedCondominium, 
            balance: newBalance,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'matricula' }
        );
      
      if (error) throw error;
      
      setBalance(newBalance);
      toast.success('Saldo atualizado com sucesso');
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Erro ao atualizar saldo');
    }
  };
  
  const formatTooltipValue = (value: number) => {
    return formatToBRL(value);
  };
  
  const getLast6Months = () => {
    const result = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(today.getMonth() - i);
      result.push({
        name: MONTHS[month.getMonth()].substring(0, 3),
        index: month.getMonth(),
        year: month.getFullYear(),
        month: month.getMonth() + 1
      });
    }
    
    return result;
  };
  
  const last6Months = getLast6Months();

  useEffect(() => {
    if (user?.selectedCondominium) {
      fetchFinancialData();
    }
  }, [user?.selectedCondominium]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Dashboard Financeiro</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-lg text-gray-500">Carregando dados financeiros...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard Financeiro</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Saldo Atual - 50% width (1 column of 4 instead of previous size) */}
          <div className="lg:col-span-1">
            <BalanceDisplay balance={balance} readOnly={true} className="h-full" />
          </div>
          
          {/* Removed Status de Pagamentos das Unidades card */}
          
          {/* Receitas Pendentes - simplified without extra lines */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden border-blue-300 shadow-md h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-800">Receitas Pendentes</h3>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-amber-50 rounded p-3">
                    <p className="text-xs text-gray-500 mb-1">Valor a Receber</p>
                    <p className="text-xl font-bold text-amber-600">
                      R$ {formatToBRL(pendingRevenueData.pendingAmount || 0)}
                    </p>
                  </div>
                  {/* Removed extra information as requested */}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {/* Empty div to maintain grid layout */}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="overflow-hidden border-blue-300 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-800">Receitas e Despesas Mensais</h3>
              </div>
              
              <div className="h-64">
                <ChartContainer 
                  config={{
                    receita: { color: '#4db35e', label: 'Receita' },
                    despesa: { color: '#f97150', label: 'Despesa' }
                  }}
                >
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatTooltipValue} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
                              <p className="text-sm font-medium">{payload[0].payload.month}</p>
                              {payload.map((entry, index) => (
                                <p key={index} className="text-sm" style={{ color: entry.color }}>
                                  {entry.name === 'receita' ? 'Receita: ' : 'Despesa: '}
                                  R$ {formatToBRL(entry.value as number)}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="receita" fill="#4db35e" name="Receita" />
                    <Bar dataKey="despesa" fill="#f97150" name="Despesa" />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-blue-300 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-800">Distribuição das Receitas</h3>
              </div>
              
              <div className="h-64">
                <ChartContainer config={{}}>
                  <RechartsPie>
                    <Pie
                      data={revenueDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const total = revenueDistributionData.reduce((sum, item) => sum + item.value, 0);
                          const percentage = total > 0 ? (data.value / total * 100).toFixed(1) : '0';
                          
                          return (
                            <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
                              <p className="text-sm font-medium">{data.name}</p>
                              <p className="text-sm">Valor: R$ {formatToBRL(data.value)}</p>
                              <p className="text-sm">Percentual: {percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPie>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-blue-300 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-800">Status de Pagamento (Últimos 6 Meses)</h3>
              </div>
              
              <ScrollArea className="h-[300px] w-full">
                <div className="min-w-[700px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b">
                        <th className="text-left p-2 bg-white sticky left-0 z-20">Unidade</th>
                        {last6Months.map((monthData) => (
                          <th key={`${monthData.year}-${monthData.month}`} className="p-2 text-center bg-white">
                            {monthData.name}/{monthData.year.toString().substring(2)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paymentStatusData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white z-10">{row.unit}</td>
                          {last6Months.map((monthData) => {
                            const monthKey = `month${monthData.index + 1}`;
                            return (
                              <td key={`${row.unit}-${monthData.year}-${monthData.month}`} className="p-2 text-center">
                                <div className={`inline-block w-4 h-4 rounded-full ${
                                  row[monthKey] === 'paid' 
                                    ? 'bg-green-500' 
                                    : 'bg-red-500'
                                }`} />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroDashboard;
