
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useFinances } from '@/hooks/use-finances';
import { DashboardCards } from '@/components/financials/DashboardCards';
import { RecentTransactions } from '@/components/financials/RecentTransactions';
import { BalanceDisplay } from '@/components/financials/BalanceDisplay';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import { Skeleton } from '@/components/ui/skeleton';

const FinanceiroDashboard = () => {
  const { 
    isLoading, 
    incomes, 
    expenses, 
    balance, 
    recentTransactions, 
    removeIncome, 
    removeExpense 
  } = useFinances();

  const calculateMonthlyData = () => {
    const monthlyData = {};
    
    // Process incomes
    incomes.forEach(income => {
      const date = new Date(income.reference_month);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }
      
      monthlyData[monthYear].income += BRLToNumber(income.amount);
    });
    
    // Process expenses
    expenses.forEach(expense => {
      const date = new Date(expense.reference_month);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }
      
      monthlyData[monthYear].expense += BRLToNumber(expense.amount);
    });
    
    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([month, data]) => ({ 
        month, 
        income: (data as { income: number, expense: number }).income,
        expense: (data as { income: number, expense: number }).expense
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        
        if (aYear !== bYear) return aYear - bYear;
        return aMonth - bMonth;
      })
      .slice(-6); // Get only the last 6 months
  };

  const prepareCategoryData = (items, type) => {
    const categoryData = {};
    
    items.forEach(item => {
      if (!categoryData[item.category]) {
        categoryData[item.category] = 0;
      }
      
      categoryData[item.category] += BRLToNumber(item.amount);
    });
    
    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
      type
    }));
  };

  const incomesByCategory = prepareCategoryData(incomes, 'income');
  const expensesByCategory = prepareCategoryData(expenses, 'expense');
  
  const monthlyData = calculateMonthlyData();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const formatCurrencyValue = (value) => {
    return formatToBRL(value);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
            <p className="text-muted-foreground">
              Acompanhe as finanças do seu condomínio em tempo real
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[300px] w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe as finanças do seu condomínio em tempo real
          </p>
        </div>

        <DashboardCards
          incomes={incomes}
          expenses={expenses}
          balance={balance?.balance || '0'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Receitas e Despesas</CardTitle>
              <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatCurrencyValue} />
                    <Tooltip formatter={(value) => formatCurrencyValue(value as number)} />
                    <Legend />
                    <Bar dataKey="income" name="Receitas" fill="#4ade80" />
                    <Bar dataKey="expense" name="Despesas" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="income" className="w-full">
            <CardHeader className="p-6 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Distribuição por Categoria</CardTitle>
                <TabsList>
                  <TabsTrigger value="income">Receitas</TabsTrigger>
                  <TabsTrigger value="expense">Despesas</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>Análise da distribuição financeira</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 pt-2">
              <TabsContent value="income" className="h-[300px] mt-0">
                {incomesByCategory.length > 0 ? (
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrencyValue(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Nenhuma receita registrada</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="expense" className="h-[300px] mt-0">
                {expensesByCategory.length > 0 ? (
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrencyValue(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Nenhuma despesa registrada</p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">Resumo Financeiro</h2>
            <BalanceDisplay 
              balance={balance} 
              isLoading={isLoading}
            />
          </div>
          
          <RecentTransactions 
            transactions={recentTransactions} 
            onDeleteIncome={removeIncome}
            onDeleteExpense={removeExpense}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroDashboard;
