
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { formatToBRL, BRLToNumber } from '@/utils/currency';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChartData {
  month: string;
  expenses: number;
  incomes: number;
}

export const ExpenseEvolutionChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

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

        // Fetch both expenses and incomes
        const [{ data: expenses }, { data: incomes }] = await Promise.all([
          supabase
            .from('business_expenses')
            .select('amount, date')
            .gte('date', sixMonthsAgo.toISOString().split('T')[0])
            .lte('date', today.toISOString().split('T')[0]),
          supabase
            .from('business_incomes')
            .select('amount, revenue_date')
            .gte('revenue_date', sixMonthsAgo.toISOString().split('T')[0])
            .lte('revenue_date', today.toISOString().split('T')[0])
        ]);

        if (!expenses || !incomes) throw new Error('Failed to fetch data');

        const monthlyData = months.map(monthStr => {
          const [year, monthNum] = monthStr.split('-');
          const yearNum = parseInt(year);
          const monthNumber = parseInt(monthNum);
          
          // Calculate monthly expenses
          const monthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getFullYear() === yearNum && 
                   expenseDate.getMonth() === monthNumber - 1;
          });
          
          const totalExpense = monthExpenses.reduce((sum, expense) => {
            const amount = typeof expense.amount === 'string' 
              ? BRLToNumber(expense.amount)
              : parseFloat(expense.amount.toString());
            return sum + amount;
          }, 0);

          // Calculate monthly incomes
          const monthIncomes = incomes.filter(income => {
            const incomeDate = new Date(income.revenue_date);
            return incomeDate.getFullYear() === yearNum && 
                   incomeDate.getMonth() === monthNumber - 1;
          });
          
          const totalIncome = monthIncomes.reduce((sum, income) => {
            const amount = typeof income.amount === 'string' 
              ? BRLToNumber(income.amount)
              : parseFloat(income.amount.toString());
            return sum + amount;
          }, 0);
          
          const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          const monthName = monthNames[monthNumber - 1];
          
          return {
            month: `${monthName}/${year.substring(2)}`,
            expenses: totalExpense,
            incomes: totalIncome
          };
        });

        setChartData(monthlyData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTooltipValue = (value: number) => {
    return formatToBRL(value);
  };

  return (
    <Card className="overflow-hidden border-blue-300 shadow-md border-t-4 border-t-brand-600">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800 text-sm md:text-base">Evolução Financeira</h3>
        </div>
        
        <div className={isMobile ? "h-52" : "h-64"}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-6 w-6 text-gray-500 animate-spin mb-2" />
              <div className="text-sm text-gray-500">Carregando dados...</div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ 
                  top: 10, 
                  right: isMobile ? 10 : 30, 
                  left: isMobile ? 0 : 0, 
                  bottom: isMobile ? 20 : 5 
                }}
                barCategoryGap={5}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: isMobile ? 9 : 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 40 : 30}
                />
                <YAxis 
                  tickFormatter={formatTooltipValue} 
                  tick={{ fontSize: isMobile ? 9 : 11 }}
                  domain={[0, 'auto']}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  width={isMobile ? 50 : undefined}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-xs md:text-sm">
                          <p className="font-medium">{payload[0].payload.month}</p>
                          {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>
                              {entry.name === 'expenses' ? 'Despesas: ' : 'Receitas: '}
                              {formatToBRL(entry.value as number)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="expenses" 
                  fill="#f97150" 
                  name="Despesas"
                  barSize={isMobile ? 20 : 30}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="incomes" 
                  fill="#4ade80" 
                  name="Receitas"
                  barSize={isMobile ? 20 : 30}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">Nenhum dado registrado nos últimos 6 meses.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

