
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { formatToBRL, BRLToNumber } from '@/utils/currency';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExpenseCategory {
  category: string;
  label: string;
}

interface ExpenseData {
  month: string;
  value: number;
}

export const ExpenseEvolutionChart = ({ matricula }: { matricula: string }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [chartData, setChartData] = useState<ExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Define category mapping for display names
  const categoryLabels: Record<string, string> = {
    agua: "Água",
    energia: "Energia",
    limpeza: "Limpeza",
    manutencao: "Manutenção",
    seguranca: "Segurança",
    salarios: "Salários",
    materiais: "Materiais",
    servicos: "Serviços",
    outros: "Outros"
  };

  // Fetch available expense categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      if (!matricula) return;

      try {
        const { data, error } = await supabase
          .from('financial_expenses')
          .select('category')
          .eq('matricula', matricula)
          .order('category');

        if (error) throw error;

        // Get unique categories
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        
        const formattedCategories: ExpenseCategory[] = uniqueCategories.map(category => ({
          category,
          label: categoryLabels[category] || category
        }));

        setCategories(formattedCategories);
        
        // Set default selected category if available
        if (formattedCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(formattedCategories[0].category);
        }
      } catch (error) {
        console.error('Error fetching expense categories:', error);
      }
    };

    fetchCategories();
  }, [matricula]);

  // Fetch expense data for the selected category (last 6 months)
  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!matricula || !selectedCategory) return;

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

        console.log('Fetching expenses for months:', months, 'category:', selectedCategory);

        const { data, error } = await supabase
          .from('financial_expenses')
          .select('amount, reference_month')
          .eq('matricula', matricula)
          .eq('category', selectedCategory)
          .in('reference_month', months);

        if (error) throw error;

        console.log('Expense data received:', data);

        // Process data for chart
        const monthlyData = months.map(monthStr => {
          const monthlyExpenses = data.filter(expense => expense.reference_month === monthStr);
          
          console.log(`Month ${monthStr} has ${monthlyExpenses.length} expenses`);
          
          const totalExpense = monthlyExpenses.reduce((sum, expense) => {
            const amount = BRLToNumber(expense.amount);
            console.log(`Amount for ${monthStr}: ${expense.amount} -> ${amount}`);
            return sum + amount;
          }, 0);
          
          const [year, monthNum] = monthStr.split('-');
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
  }, [matricula, selectedCategory]);

  const formatTooltipValue = (value: number) => {
    return formatToBRL(value);
  };

  return (
    <Card className="overflow-hidden border-blue-300 shadow-md border-t-4 border-t-brand-600">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800 text-sm md:text-base">Evolução de Despesas</h3>
          
          <div className="flex-grow flex justify-center">
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className={`${isMobile ? 'w-[140px]' : 'w-[180px]'} h-8 text-xs`}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.category} value={category.category}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                            {categoryLabels[selectedCategory] || selectedCategory}: {formatToBRL(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend formatter={(value) => `${categoryLabels[selectedCategory] || selectedCategory}`} />
                <Bar 
                  dataKey="value" 
                  fill="#f97150" 
                  name={categoryLabels[selectedCategory] || selectedCategory}
                  barSize={isMobile ? 20 : 30}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">Nenhum dado disponível para esta categoria nos últimos 6 meses.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
