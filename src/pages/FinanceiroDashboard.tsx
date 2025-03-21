
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BalanceDisplay } from '@/components/financials/BalanceDisplay';
import { useFinances } from '@/hooks/use-finances';
import { useApp } from '@/contexts/AppContext';
import { useResidents } from '@/hooks/use-residents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import { format, subMonths, parse, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, XCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#F1C40F', '#3498DB'];

const FinanceiroDashboard = () => {
  const { user } = useApp();
  const { incomes, expenses, balance, isLoading, recentTransactions } = useFinances();
  const { residents, isLoading: isLoadingResidents } = useResidents();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [unitsData, setUnitsData] = useState<any>({});

  // Function to calculate monthly data for bar chart (last 6 months)
  const calculateMonthlyData = () => {
    if (!incomes.length && !expenses.length) return [];

    const lastSixMonths = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      return format(date, 'MM/yyyy');
    }).reverse();

    const data = lastSixMonths.map(month => {
      const monthIncomes = incomes.filter(income => income.reference_month === month);
      const monthExpenses = expenses.filter(expense => expense.reference_month === month);

      const totalIncome = monthIncomes.reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
      const totalExpense = monthExpenses.reduce((sum, expense) => sum + BRLToNumber(expense.amount), 0);

      return {
        month: month,
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
        // Format month for display
        displayMonth: format(
          parse(month, 'MM/yyyy', new Date()),
          'MMM/yy',
          { locale: ptBR }
        )
      };
    });

    return data;
  };

  // Function to calculate income distribution for pie chart
  const calculateIncomeDistribution = () => {
    if (!incomes.length) return [];

    // Group by category
    const categories: { [key: string]: number } = {};
    incomes.forEach(income => {
      const category = income.category || 'Outros';
      const amount = BRLToNumber(income.amount);
      if (categories[category]) {
        categories[category] += amount;
      } else {
        categories[category] = amount;
      }
    });

    // Convert to array for chart
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Function to calculate units payment status
  const calculateUnitsPaymentStatus = () => {
    if (!residents.length) return { totalUnits: 0, paidUnits: 0, pendingAmount: 0, pendingUnits: 0 };
    if (!user?.matricula && !user?.selectedCondominium) {
      console.error('No matricula found for logged in user');
      return { totalUnits: 0, paidUnits: 0, pendingAmount: 0, pendingUnits: 0 };
    }

    const currentMonth = format(new Date(), 'MM/yyyy');
    const matricula = user?.selectedCondominium || user?.matricula || '';
    
    // Count total units from residents table with matching matricula
    const residentsWithMatricula = residents.filter(resident => resident.matricula === matricula);
    const totalUnits = residentsWithMatricula.length;
    
    // Count paid units from financial_incomes with category "taxa_condominio"
    // and reference_month equal to current month and matching matricula
    const paidUnitsSet = new Set();
    
    incomes.forEach(income => {
      if (
        income.reference_month === currentMonth && 
        income.category === 'taxa_condominio' && 
        income.unit &&
        income.matricula === matricula
      ) {
        paidUnitsSet.add(income.unit);
      }
    });
    
    const paidUnits = paidUnitsSet.size;
    const pendingUnits = totalUnits - paidUnits;
    
    // Calculate pending amount (expected - received)
    const expectedTotal = residentsWithMatricula.reduce((sum, resident) => {
      return sum + (resident.valor_condominio ? BRLToNumber(resident.valor_condominio) : 0);
    }, 0);
    
    const paidTotal = incomes
      .filter(income => 
        income.reference_month === currentMonth && 
        income.category === 'taxa_condominio' &&
        income.matricula === matricula
      )
      .reduce((sum, income) => sum + BRLToNumber(income.amount), 0);
    
    const pendingAmount = Math.max(0, expectedTotal - paidTotal);
    
    console.log('Payment status calculation:', { 
      matricula,
      totalUnits, 
      paidUnits, 
      pendingUnits,
      pendingAmount,
      currentMonth,
      paidUnitsSet: Array.from(paidUnitsSet),
      residentsCount: residentsWithMatricula.length,
      incomesForThisMatricula: incomes.filter(i => i.matricula === matricula).length
    });
    
    return { 
      totalUnits, 
      paidUnits, 
      pendingAmount,
      pendingUnits
    };
  };

  // Calculate payment status for all units for each month of the current year
  const calculateYearlyPaymentStatus = () => {
    if (!residents.length || !incomes.length) return {};
    if (!user?.matricula && !user?.selectedCondominium) return {};

    const matricula = user?.selectedCondominium || user?.matricula || '';
    const currentYear = new Date().getFullYear();
    const monthsInYear = Array.from({ length: 12 }).map((_, i) => {
      return format(new Date(currentYear, i, 1), 'MM/yyyy');
    });

    // Filter residents by matricula
    const residentsWithMatricula = residents.filter(resident => resident.matricula === matricula);
    const paymentStatus: Record<string, Record<string, boolean>> = {};

    // Initialize all residents for all months as not paid
    residentsWithMatricula.forEach(resident => {
      paymentStatus[resident.unidade] = {};
      monthsInYear.forEach(month => {
        paymentStatus[resident.unidade][month] = false;
      });
    });

    // Mark payments based on income records, filtered by matricula
    incomes
      .filter(income => income.matricula === matricula)
      .forEach(income => {
        // Only process incomes from current year
        if (income.unit && income.reference_month && monthsInYear.includes(income.reference_month)) {
          if (paymentStatus[income.unit]) {
            paymentStatus[income.unit][income.reference_month] = true;
          }
        }
      });

    return paymentStatus;
  };

  useEffect(() => {
    if (!isLoading && !isLoadingResidents) {
      setMonthlyData(calculateMonthlyData());
      setPieData(calculateIncomeDistribution());
      setUnitsData(calculateUnitsPaymentStatus());
      
      console.log('Finances data loaded:', {
        matricula: user?.selectedCondominium || user?.matricula,
        incomesCount: incomes.length,
        expensesCount: expenses.length,
        residentsCount: residents.length,
        currentMonth: format(new Date(), 'MM/yyyy')
      });
    }
  }, [isLoading, isLoadingResidents, incomes, expenses, residents, user?.matricula, user?.selectedCondominium]);

  if (isLoading || isLoadingResidents) {
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

  const yearlyPaymentStatus = calculateYearlyPaymentStatus();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard Financeiro</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Balance Card */}
          <div className="md:col-span-1">
            <BalanceDisplay 
              balance={balance?.balance || '0,00'} 
              onBalanceChange={async (newBalance) => {}}
            />
          </div>
          
          {/* Units Payment Status Card */}
          <Card className="bg-gradient-to-br from-white to-green-50 border-2 border-green-300 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Status de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Unidades:</span>
                  <span className="font-medium">{unitsData.totalUnits || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unidades Pagas:</span>
                  <span className="font-medium text-green-600">{unitsData.paidUnits || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unidades Pendentes:</span>
                  <span className="font-medium text-red-600">{unitsData.pendingUnits || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Pending Income Card */}
          <Card className="bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-300 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Receitas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="flex items-baseline bg-white/70 px-3 py-1 rounded-md">
                  <span className="text-sm font-bold mr-1 tracking-tight">R$</span>
                  <span className="text-xl font-bold text-amber-600">
                    {formatToBRL(unitsData.pendingAmount || 0)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-center mt-2 text-gray-500">
                Valores a receber no mês atual
              </p>
            </CardContent>
          </Card>
          
          {/* Taxa de Inadimplência Card */}
          <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-300 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Taxa de Inadimplência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-3xl font-bold text-blue-600">
                  {unitsData.totalUnits 
                    ? Math.round((unitsData.pendingUnits / unitsData.totalUnits) * 100) 
                    : 0}%
                </div>
              </div>
              <p className="text-xs text-center mt-2 text-gray-500">
                Percentual de unidades com pagamento pendente
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Income vs Expense Chart */}
          <Card className="border-2 border-blue-300">
            <CardHeader>
              <CardTitle>Receitas x Despesas (6 meses)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  income: { color: "#22c55e" },
                  expense: { color: "#ef4444" },
                  balance: { color: "#3b82f6" }
                }}
              >
                <BarChart data={monthlyData}>
                  <XAxis dataKey="displayMonth" />
                  <YAxis tickFormatter={(value) => `R$ ${formatToBRL(value as number)}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border rounded shadow-lg">
                            <p className="font-semibold">{payload[0].payload.displayMonth}</p>
                            {payload.map((entry, index) => (
                              <p key={index} style={{ color: entry.color }}>
                                {entry.name}: R$ {formatToBRL(entry.value as number)}
                              </p>
                            ))}
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
              </ChartContainer>
            </CardContent>
          </Card>
          
          {/* Income Distribution Pie Chart */}
          <Card className="border-2 border-blue-300">
            <CardHeader>
              <CardTitle>Distribuição de Receitas</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer 
                config={{
                  category: { color: "#3b82f6" }
                }}
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `R$ ${formatToBRL(value as number)}`}
                  />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Units vs Paid Units Chart */}
        <Card className="mb-6 border-2 border-blue-300">
          <CardHeader>
            <CardTitle>Unidades x Pagamentos no Mês Atual</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ChartContainer
              config={{
                units: { color: "#3b82f6" },
                paid: { color: "#22c55e" }
              }}
            >
              <BarChart 
                data={[
                  { name: 'Total de Unidades', units: unitsData.totalUnits },
                  { name: 'Unidades Pagas', paid: unitsData.paidUnits }
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="units" name="Total de Unidades" fill="#3b82f6" />
                <Bar dataKey="paid" name="Unidades Pagas" fill="#22c55e" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Yearly Payment Status by Unit */}
        <Card className="mb-6 border-2 border-blue-300">
          <CardHeader>
            <CardTitle>Status de Pagamento por Unidade (Ano Atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-left bg-gray-100 sticky left-0">Unidade</th>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <th key={i} className="py-2 px-3 text-center bg-gray-100">
                        {format(new Date(new Date().getFullYear(), i, 1), 'MMM', { locale: ptBR })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(yearlyPaymentStatus).sort((a, b) => a[0].localeCompare(b[0])).map(([unit, months]) => (
                    <tr key={unit} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium sticky left-0 bg-white">{unit}</td>
                      {Array.from({ length: 12 }).map((_, i) => {
                        const monthKey = format(new Date(new Date().getFullYear(), i, 1), 'MM/yyyy');
                        const isPaid = months[monthKey];
                        // Only show status for months up to current month
                        const isFutureMonth = isAfter(
                          parse(monthKey, 'MM/yyyy', new Date()),
                          new Date()
                        );
                        
                        return (
                          <td key={i} className="py-2 px-3 text-center">
                            {!isFutureMonth ? (
                              isPaid ? (
                                <CheckCircle2 className="inline-block text-green-500 h-5 w-5" />
                              ) : (
                                <XCircle className="inline-block text-red-500 h-5 w-5" />
                              )
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroDashboard;
