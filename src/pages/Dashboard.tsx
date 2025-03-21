
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useFinances } from '@/hooks/use-finances';
import { DashboardCards } from '@/components/financials/DashboardCards';
import { RecentTransactions } from '@/components/financials/RecentTransactions';
import { BalanceDisplay } from '@/components/financials/BalanceDisplay';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { 
    isLoading, 
    incomes, 
    expenses, 
    balance, 
    recentTransactions, 
    removeIncome, 
    removeExpense,
    updateBalance
  } = useFinances();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe as finanças do seu condomínio em tempo real
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <DashboardCards
            incomes={incomes}
            expenses={expenses}
            balance={balance?.balance || '0'}
          />
        )}

        <div className="grid grid-cols-1 gap-6">
          <BalanceDisplay 
            balance={balance} 
            isLoading={isLoading}
            onBalanceChange={updateBalance}
          />
          
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

export default Dashboard;
