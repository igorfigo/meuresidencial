
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

interface ExpenseData {
  month: string;
  value: number;
}

export const ExpenseEvolutionChart = () => {
  const [chartData, setChartData] = useState<ExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Fetch expense data for the last 6 months
  useEffect(() => {
    const fetchExpenseData = async () => {
      setIsLoading(true);

      try {
        // Calculate the date range for the last 6 months
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        
        const months = [];
        for (let i = 0; i < 6; i++) {
          const month = new Date(sixMonthsAgo);
          month.setMonth(sixMonthsAgo.getMonth() + i);
          months.push(format(month, 'yyyy-MM', { locale: ptBR }));
        }

        console.log('Fetching expenses for months:', months);

        const { data: expenses, error } = await supabase
          .from('business_expenses')
          .select('amount, date')
          .in('date', months.map(month => {
            const [year, monthNum] = month.split('-');
            const lastDayOfMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
            return Array.from({ length: lastDayOfMonth }, (_, i) => 
              `${year}-${monthNum}-${String(i + 1).padStart(2, '0')}`
            );
          }).flat());

        if (error) throw error;

        console.log('Expense data received:', expenses);

        // Process data for chart
        const monthlyData = months.map(monthStr => {
          const [year, monthNum] = monthStr.split('-');
          const monthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getFullYear() === parseInt(year) && 
                   expenseDate.getMonth() === parseInt(monthNum) - 1;
          });
          
          const totalExpense = monthExpenses.reduce((sum, expense) => {
            return sum + parseFloat(expense.amount);
          }, 0);
          
          const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          const monthName = monthNames[parseInt(monthNum) - 1];
          
          console.log(`Month ${monthStr} total: ${totalExpense}`);
          
          return {
            month: `${monthName}/${year.substring(2)}`,
            value: totalExpense
          };
        });

        console.log('Processed chart data:', monthlyData);
        setChartData(monthlyData);
      } catch (error) {
        console.error('Error fetching expense data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenseData();
  }, []);

  const formatTooltipValue = (value: number) => {
    return formatToBRL(value);
  };

  return (
    <Card className="overflow-hidden border-blue-300 shadow-md border-t-4 border-t-brand-600">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800 text-sm md:text-base">Evolução de Despesas</h3>
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
                          <p style={{ color: '#f97150' }}>
                            Total: {formatToBRL(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend formatter={() => 'Total de Despesas'} />
                <Bar 
                  dataKey="value" 
                  fill="#f97150" 
                  name="Total de Despesas"
                  barSize={isMobile ? 20 : 30}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">Nenhuma despesa registrada nos últimos 6 meses.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
