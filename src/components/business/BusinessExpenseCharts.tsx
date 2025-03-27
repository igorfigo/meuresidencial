
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessExpense } from '@/hooks/use-business-expenses';
import { formatCurrency } from '@/utils/currency';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface BusinessExpenseChartsProps {
  expenses: BusinessExpense[];
  expenseCategories: { id: string; label: string }[];
}

export const BusinessExpenseCharts = ({ expenses, expenseCategories }: BusinessExpenseChartsProps) => {
  // Skip chart rendering if no data
  if (!expenses.length) {
    return null;
  }

  // Data for expense by category chart
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    // Initialize map with all categories at 0
    expenseCategories.forEach(cat => {
      categoryMap.set(cat.id, 0);
    });
    
    // Sum expenses by category
    expenses.forEach(expense => {
      const currentValue = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, currentValue + expense.amount);
    });
    
    // Convert map to array for the chart
    return Array.from(categoryMap).map(([category, value]) => {
      const categoryLabel = expenseCategories.find(cat => cat.id === category)?.label || category;
      return {
        name: categoryLabel,
        value,
        id: category,
      };
    }).filter(item => item.value > 0); // Filter out zero values
  }, [expenses, expenseCategories]);

  // Data for monthly expense chart
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, number>();
    
    // Process expenses by month
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      if (!isValid(date)) return;
      
      const month = format(date, 'yyyy-MM');
      const currentValue = monthlyMap.get(month) || 0;
      monthlyMap.set(month, currentValue + expense.amount);
    });
    
    // Sort by month and format for display
    return Array.from(monthlyMap)
      .map(([month, value]) => {
        const [year, monthNum] = month.split('-');
        const displayMonth = format(
          new Date(parseInt(year), parseInt(monthNum) - 1, 1),
          'MMM/yy',
          { locale: ptBR }
        );
        return {
          month: displayMonth,
          value,
          originalMonth: month
        };
      })
      .sort((a, b) => a.originalMonth.localeCompare(b.originalMonth))
      .slice(-6); // Get last 6 months
  }, [expenses]);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7c43', '#8dd1e1', '#a6bddb', '#f46d43'];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded-md shadow-md">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-blue-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Category Distribution Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
          </div>
          <CardDescription>Valor total por categoria de despesa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Evolution Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Evolução Mensal</CardTitle>
          </div>
          <CardDescription>Despesas totais por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Valor']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar dataKey="value" fill="#0088FE" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
