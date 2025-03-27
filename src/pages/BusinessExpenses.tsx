
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useBusinessExpenses } from '@/hooks/use-business-expenses';
import { ExpensesList } from '@/components/business-expenses/ExpensesList';

export default function BusinessExpenses() {
  const {
    expenses,
    isLoading,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useBusinessExpenses();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <ExpensesList
          expenses={expenses || []}
          isLoading={isLoading}
          onAddExpense={createExpense}
          onUpdateExpense={updateExpense}
          onDeleteExpense={deleteExpense}
        />
      </div>
    </DashboardLayout>
  );
}
