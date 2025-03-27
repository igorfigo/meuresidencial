
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ExpenseForm } from '@/components/business-expenses/ExpenseForm';
import { ExpenseList } from '@/components/business-expenses/ExpenseList';
import { ExpenseSummary } from '@/components/business-expenses/ExpenseSummary';
import { useBusinessExpenses, BusinessExpense } from '@/hooks/use-business-expenses';
import { Plus } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function BusinessDespesas() {
  const { 
    expenses, 
    isLoading, 
    createExpense, 
    updateExpense, 
    deleteExpense,
    totalAmount,
    categorySummary,
    statusSummary
  } = useBusinessExpenses();
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCreateExpense = (expense: BusinessExpense) => {
    createExpense.mutate(expense);
  };

  const handleUpdateExpense = (expense: BusinessExpense) => {
    updateExpense.mutate(expense);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense.mutate(id);
  };

  // Filter and search expenses
  const filteredExpenses = expenses.filter(expense => {
    // Apply status filter
    if (filter !== 'all' && expense.status !== filter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.reference.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Despesas Empresariais</h1>
          <p className="text-muted-foreground">
            Gerencie todas as despesas relacionadas ao negócio.
          </p>
        </div>
        
        {/* Summary Cards */}
        <div className="mb-8">
          <ExpenseSummary 
            totalAmount={totalAmount} 
            categorySummary={categorySummary}
            statusSummary={statusSummary}
          />
        </div>
        
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3">
            <Input
              placeholder="Buscar despesas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72"
            />
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Button onClick={() => setIsExpenseModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </div>
        </div>
        
        {/* Expenses List */}
        <ExpenseList
          expenses={filteredExpenses}
          isLoading={isLoading}
          onUpdate={handleUpdateExpense}
          onDelete={handleDeleteExpense}
        />
        
        {/* Add Expense Form Modal */}
        <ExpenseForm
          open={isExpenseModalOpen}
          onOpenChange={setIsExpenseModalOpen}
          onSubmit={handleCreateExpense}
        />
      </div>
    </DashboardLayout>
  );
}
