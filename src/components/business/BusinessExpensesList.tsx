
import React from 'react';
import { useBusinessExpenses } from '@/hooks/use-business-expenses';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/currency';

const BusinessExpensesList: React.FC = () => {
  const { expenses, isLoading } = useBusinessExpenses();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhuma despesa empresarial encontrada.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">{expense.description}</TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell className="text-right">{formatCurrency(parseFloat(expense.amount))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BusinessExpensesList;
