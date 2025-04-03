
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { ExpenseEvolutionChart } from '@/components/financials/ExpenseEvolutionChart';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const FinanceiroFluxoCaixa = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const { user } = useApp();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    if (user?.selectedCondominium) {
      fetchChartData();
    }
  }, [user?.selectedCondominium]);

  const fetchChartData = async () => {
    if (!user?.selectedCondominium) return;
    
    setIsLoading(true);
    try {
      // Get last 6 months of data for chart
      const now = new Date();
      const months = [];
      let totalIncValue = 0;
      let totalExpValue = 0;
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = `${d.getMonth() + 1}`.padStart(2, '0');
        const year = d.getFullYear();
        const monthStr = `${month}/${year}`;
        months.push({ month: monthStr, income: 0, expense: 0 });
      }
      
      // Fetch income data
      const { data: incomeData, error: incomeError } = await supabase
        .from('financial_incomes')
        .select('amount, reference_month')
        .eq('matricula', user.selectedCondominium);
        
      if (incomeError) throw incomeError;
      
      // Fetch expense data
      const { data: expenseData, error: expenseError } = await supabase
        .from('financial_expenses')
        .select('amount, reference_month')
        .eq('matricula', user.selectedCondominium);
        
      if (expenseError) throw expenseError;
      
      // Process income data
      incomeData?.forEach(income => {
        const amount = parseFloat(income.amount);
        totalIncValue += amount;
        
        const month = months.find(m => m.month === income.reference_month);
        if (month) {
          month.income += amount;
        }
      });
      
      // Process expense data
      expenseData?.forEach(expense => {
        const amount = parseFloat(expense.amount);
        totalExpValue += amount;
        
        const month = months.find(m => m.month === expense.reference_month);
        if (month) {
          month.expense += amount;
        }
      });
      
      setChartData(months);
      setTotalIncome(totalIncValue);
      setTotalExpense(totalExpValue);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast.error('Erro ao carregar dados para o gráfico.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-brand-600" />
          Fluxo de Caixa
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Total de Receitas</p>
                      <h3 className="text-2xl font-bold text-green-700">
                        R$ {totalIncome.toFixed(2)}
                      </h3>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800">Total de Despesas</p>
                      <h3 className="text-2xl font-bold text-red-700">
                        R$ {totalExpense.toFixed(2)}
                      </h3>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Balanço</p>
                      <h3 className={`text-2xl font-bold ${
                        totalIncome - totalExpense >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        R$ {(totalIncome - totalExpense).toFixed(2)}
                      </h3>
                    </div>
                    <DollarSign className={`h-8 w-8 ${
                      totalIncome - totalExpense >= 0 ? 'text-green-500' : 'text-red-500'
                    }`} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <ExpenseEvolutionChart data={chartData} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinanceiroFluxoCaixa;
