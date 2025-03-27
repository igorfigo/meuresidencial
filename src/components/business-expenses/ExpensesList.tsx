
import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { PlusCircle, MoreVertical, Edit, Trash } from 'lucide-react';
import { ExpenseForm } from './ExpenseForm';
import { BusinessExpense } from '@/hooks/use-business-expenses';

interface ExpensesListProps {
  expenses: BusinessExpense[];
  isLoading: boolean;
  onAddExpense: (expense: Omit<BusinessExpense, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateExpense: (id: string, expense: Partial<BusinessExpense>) => void;
  onDeleteExpense: (id: string) => void;
}

export function ExpensesList({
  expenses,
  isLoading,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}: ExpensesListProps) {
  const [selectedExpense, setSelectedExpense] = useState<BusinessExpense | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleAddSubmit = (values: any) => {
    onAddExpense({
      title: values.title,
      category: values.category,
      vendor: values.vendor,
      amount: values.amount,
      payment_date: values.payment_date.toISOString().split('T')[0],
      description: values.description,
    });
    setOpenAddDialog(false);
  };

  const handleEditSubmit = (values: any) => {
    if (selectedExpense) {
      onUpdateExpense(selectedExpense.id, {
        title: values.title,
        category: values.category,
        vendor: values.vendor,
        amount: values.amount,
        payment_date: values.payment_date.toISOString().split('T')[0],
        description: values.description,
      });
    }
    setOpenEditDialog(false);
    setSelectedExpense(null);
  };

  const handleDelete = () => {
    if (selectedExpense) {
      onDeleteExpense(selectedExpense.id);
    }
    setOpenDeleteDialog(false);
    setSelectedExpense(null);
  };

  const editExpense = (expense: BusinessExpense) => {
    setSelectedExpense(expense);
    setOpenEditDialog(true);
  };

  const confirmDelete = (expense: BusinessExpense) => {
    setSelectedExpense(expense);
    setOpenDeleteDialog(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Business Expenses</CardTitle>
          <CardDescription>Manage your business expenses</CardDescription>
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Enter the details for the new business expense
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm
              onSubmit={handleAddSubmit}
              onCancel={() => setOpenAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Loading expenses...</div>
        ) : expenses && expenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(expense.payment_date), 'PP')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => editExpense(expense)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(expense)} className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">No expenses found</p>
            <Button onClick={() => setOpenAddDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add your first expense
            </Button>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the details of the expense
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <ExpenseForm
              expense={selectedExpense}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setOpenEditDialog(false);
                setSelectedExpense(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedExpense(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
