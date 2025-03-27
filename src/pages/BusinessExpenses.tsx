
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ExpenseForm } from '@/components/business-expenses/ExpenseForm';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBusinessExpenses } from '@/hooks/use-business-expenses';
import { AlertCircle } from 'lucide-react';

const BusinessExpenses = () => {
  const { expenses, isLoading, error, addExpense, deleteExpense } = useBusinessExpenses();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const handleAddExpense = async (data: any) => {
    await addExpense(data);
    setIsAddDialogOpen(false);
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      await deleteExpense(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-64">
                <p>Carregando despesas...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              Ocorreu um erro ao carregar as despesas. Por favor, tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Despesas Empresariais</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Despesa</DialogTitle>
                </DialogHeader>
                <ExpenseForm onSubmit={handleAddExpense} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {expenses && expenses.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data de Pagamento</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.title}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.vendor}</TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>{formatDate(expense.payment_date)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">
                  Nenhuma despesa cadastrada ainda.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Adicionar Primeira Despesa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BusinessExpenses;
