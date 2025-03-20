
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { RecentTransactions } from '@/components/financials/RecentTransactions';
import { useFinances } from '@/hooks/use-finances';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { IncomeForm } from '@/components/financials/IncomeForm';
import { ExpenseForm } from '@/components/financials/ExpenseForm';
import { FinancialDashboard } from '@/components/financials/FinancialDashboard';
import { ResidentsSummary } from '@/components/financials/ResidentsSummary';
import { AnnouncementsSummary } from '@/components/financials/AnnouncementsSummary';

const FinanceiroReceitasDespesas = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isIncomeSheetOpen, setIsIncomeSheetOpen] = useState(false);
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
  
  const { 
    isLoading, 
    incomes, 
    expenses, 
    balance, 
    recentTransactions, 
    addIncome, 
    editIncome, 
    removeIncome, 
    addExpense, 
    editExpense, 
    removeExpense,
    updateBalance,
    refreshData
  } = useFinances();
  
  const handleAddIncome = async (incomeData: any) => {
    await addIncome(incomeData);
    setIsIncomeSheetOpen(false);
  };
  
  const handleAddExpense = async (expenseData: any) => {
    await addExpense(expenseData);
    setIsExpenseSheetOpen(false);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          
          <div className="flex gap-2">
            <Sheet open={isIncomeSheetOpen} onOpenChange={setIsIncomeSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" /> Nova Receita
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Nova Receita</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <IncomeForm 
                    onSave={handleAddIncome}
                    onCancel={() => setIsIncomeSheetOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            <Sheet open={isExpenseSheetOpen} onOpenChange={setIsExpenseSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" /> Nova Despesa
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Nova Despesa</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ExpenseForm 
                    onSave={handleAddExpense}
                    onCancel={() => setIsExpenseSheetOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="py-4">
            {!isLoading && balance && (
              <FinancialDashboard 
                balance={balance?.balance || '0'} 
                incomes={incomes} 
                expenses={expenses} 
                onBalanceChange={updateBalance}
              />
            )}
          </TabsContent>
          
          <TabsContent value="transactions" className="py-4">
            <RecentTransactions 
              transactions={recentTransactions}
              onDeleteIncome={removeIncome}
              onDeleteExpense={removeExpense}
            />
          </TabsContent>
          
          <TabsContent value="info" className="py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ResidentsSummary />
              <AnnouncementsSummary />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroReceitasDespesas;
