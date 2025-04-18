import React, { useState } from 'react';
import { Plus, Search, Receipt, Trash, Eye } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'sonner';
import { useBusinessExpenses, BusinessExpense } from '@/hooks/use-business-expenses';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

const expenseCategories = [
  { id: 'rent', label: 'Aluguel' },
  { id: 'utilities', label: 'Serviços Públicos' },
  { id: 'supplies', label: 'Suprimentos' },
  { id: 'payroll', label: 'Folha de Pagamento' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'travel', label: 'Viagens' },
  { id: 'maintenance', label: 'Manutenção' },
  { id: 'software', label: 'Software/Assinaturas' },
  { id: 'legal', label: 'Serviços Jurídicos' },
  { id: 'accounting', label: 'Serviços Contábeis' },
  { id: 'taxes', label: 'Impostos' },
  { id: 'other', label: 'Outros' }
];

const BusinessCost = () => {
  const [openNewExpenseDialog, setOpenNewExpenseDialog] = useState(false);
  const [openEditExpenseDialog, setOpenEditExpenseDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState<BusinessExpense | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    expenses, 
    isLoading, 
    createExpense,
    updateExpense,
    deleteExpense 
  } = useBusinessExpenses();

  const filteredExpenses = expenses?.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = filteredExpenses ? Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = filteredExpenses?.slice(startIndex, endIndex);

  const handleSubmitNewExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const description = String(formData.get('description') || '');
    const amountValue = formData.get('amount');
    const amount = amountValue ? parseFloat(String(amountValue)) : 0;
    const date = String(formData.get('date') || '');
    const category = String(formData.get('category') || '');
    
    try {
      await createExpense({
        description,
        amount,
        date,
        category
      });
      
      setOpenNewExpenseDialog(false);
    } catch (error) {
      console.error("Erro ao registrar despesa:", error);
    }
  };

  const handleSubmitEditExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedExpense?.id) return;
    
    const formData = new FormData(e.currentTarget);
    const description = String(formData.get('description') || '');
    const amountValue = formData.get('amount');
    const amount = amountValue ? parseFloat(String(amountValue)) : 0;
    const date = String(formData.get('date') || '');
    const category = String(formData.get('category') || '');
    
    try {
      await updateExpense(selectedExpense.id, {
        description,
        amount,
        date,
        category
      });
      
      setOpenEditExpenseDialog(false);
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
    }
  };

  const handleEditExpense = (expense: BusinessExpense) => {
    setSelectedExpense(expense);
    setOpenEditExpenseDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="w-full">
            <h1 className="text-3xl font-bold tracking-tight">Despesas Empresariais</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as despesas da empresa
            </p>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-2">
            <Dialog open={openNewExpenseDialog} onOpenChange={setOpenNewExpenseDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleSubmitNewExpense}>
                  <DialogHeader>
                    <DialogTitle>Nova Despesa</DialogTitle>
                    <DialogDescription>
                      Preencha os dados da despesa abaixo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Input id="description" name="description" required placeholder="Descrição da despesa" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0,00" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Data</Label>
                      <Input id="date" name="date" type="date" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select name="category" required defaultValue="">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenNewExpenseDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Separator className="w-full mb-8" />

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar despesas..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {expenseCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-100 dark:bg-gray-800"></div>
                <div className="pt-4 p-6 space-y-2">
                  <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                </div>
                <div className="h-12 bg-gray-50 dark:bg-gray-900"></div>
              </Card>
            ))}
          </div>
        ) : currentExpenses?.length ? (
          <div className="space-y-4">
            <div className="overflow-x-auto border-t-4 border-t-brand-500 rounded-md bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center">Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentExpenses.map((expense: BusinessExpense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        {expenseCategories.find(cat => cat.id === expense.category)?.label || expense.category}
                      </TableCell>
                      <TableCell className="text-center">{formatDate(expense.date)}</TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditExpense(expense)}
                            title="Editar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600"
                                title="Excluir"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir despesa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Pagination className="justify-center">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(prev => prev - 1);
                        }} 
                      />
                    </PaginationItem>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(prev => prev + 1);
                        }} 
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border-t-4 border-t-brand-500 rounded-md bg-white dark:bg-gray-900 p-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Nenhuma despesa encontrada</h3>
            <p className="text-muted-foreground mt-2 mb-4 max-w-md">
              {searchQuery || selectedCategory !== 'all'
                ? "Tente ajustar os filtros da sua busca ou" 
                : "Você ainda não possui despesas cadastradas. Vamos"}
              {" registrar sua primeira despesa agora?"}
            </p>
            <Button onClick={() => setOpenNewExpenseDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </div>
        )}
      </div>

      <Dialog open={openEditExpenseDialog} onOpenChange={setOpenEditExpenseDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <form onSubmit={handleSubmitEditExpense}>
            <DialogHeader>
              <DialogTitle>Editar Despesa</DialogTitle>
              <DialogDescription>
                Altere os dados da despesa abaixo
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Input 
                  id="edit-description" 
                  name="description" 
                  required 
                  placeholder="Descrição da despesa" 
                  defaultValue={selectedExpense?.description}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Valor (R$)</Label>
                <Input 
                  id="edit-amount" 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  required 
                  placeholder="0,00" 
                  defaultValue={selectedExpense?.amount}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Data</Label>
                <Input 
                  id="edit-date" 
                  name="date" 
                  type="date" 
                  required 
                  defaultValue={selectedExpense?.date}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <Select name="category" required defaultValue={selectedExpense?.category || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEditExpenseDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BusinessCost;
