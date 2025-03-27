
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import { ExpenseForm } from './ExpenseForm';
import { BusinessExpense } from '@/hooks/use-business-expenses';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ExpenseListProps {
  expenses: BusinessExpense[];
  isLoading: boolean;
  onUpdate: (expense: BusinessExpense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, isLoading, onUpdate, onDelete }: ExpenseListProps) {
  const [editExpense, setEditExpense] = useState<BusinessExpense | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEditExpense = (expense: BusinessExpense) => {
    setEditExpense(expense);
    setIsEditOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pago</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card className="border border-dashed border-gray-300">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <Pencil className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900">Sem despesas cadastradas</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1">
            Ainda não há despesas registradas. Clique no botão "Nova Despesa" para adicionar a primeira.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Descrição</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Data</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Categoria</th>
              <th className="text-right py-3 px-4 font-medium text-sm text-gray-600">Valor</th>
              <th className="text-center py-3 px-4 font-medium text-sm text-gray-600">Status</th>
              <th className="text-right py-3 px-4 font-medium text-sm text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm">{expense.description}</td>
                <td className="py-3 px-4 text-sm">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                <td className="py-3 px-4 text-sm">{expense.category}</td>
                <td className="py-3 px-4 text-sm text-right">
                  R$ {parseFloat(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-sm text-center">{getStatusBadge(expense.status)}</td>
                <td className="py-3 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id!)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Excluir</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editExpense && (
        <ExpenseForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          defaultValues={editExpense}
          onSubmit={onUpdate}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
