import React, { useState } from 'react';
import { Eye, Receipt, Search, Trash, Plus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/currency';
import { useBusinessIncomes, type BusinessIncome } from '@/hooks/use-business-incomes';
import { IncomeForm } from '@/components/business/IncomeForm';

export default function BusinessIncome() {
  const [openNewIncomeDialog, setOpenNewIncomeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openEditIncomeDialog, setOpenEditIncomeDialog] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<BusinessIncome | null>(null);
  const { incomes, isLoading, updateIncome, deleteIncome } = useBusinessIncomes();

  const filteredIncomes = incomes?.filter(income => {
    return income.full_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
           income.revenue_type.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCompetency = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const parts = dateString.split('-');
      if (parts.length >= 2) {
        const year = parts[0];
        const month = parts[1];
        return `${month}/${year}`;
      }
      return '';
    } catch (error) {
      console.error("Error formatting competency date:", error, dateString);
      return '';
    }
  };

  const handleEditIncome = (income: BusinessIncome) => {
    setSelectedIncome(income);
    setOpenEditIncomeDialog(true);
  };

  const handleUpdateIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedIncome?.id) return;
    
    const formData = new FormData(e.currentTarget);
    const identifier = String(formData.get('identifier') || '');
    const amountValue = formData.get('amount');
    const amount = amountValue ? parseFloat(String(amountValue).replace(/[^\d,.-]/g, '').replace(',', '.')) : 0;
    const dateValue = formData.get('date');
    const date = dateValue ? String(dateValue) : '';
    
    const system_code = identifier.substring(0, 2);
    const manager_code = identifier.substring(2, 13);
    const revenue_type = identifier.substring(13, 16);
    
    try {
      await updateIncome(selectedIncome.id, {
        revenue_date: date,
        full_identifier: identifier,
        system_code,
        manager_code,
        revenue_type,
        amount
      });
      
      setOpenEditIncomeDialog(false);
    } catch (error) {
      console.error("Erro ao atualizar receita:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="w-full">
            <h1 className="text-3xl font-bold tracking-tight">Business Income</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as receitas da empresa
            </p>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-2">
            <Dialog open={openNewIncomeDialog} onOpenChange={setOpenNewIncomeDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Nova Receita</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da receita abaixo
                  </DialogDescription>
                </DialogHeader>
                <IncomeForm onSuccess={() => setOpenNewIncomeDialog(false)} />
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
              placeholder="Buscar receitas..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
        ) : filteredIncomes?.length ? (
          <div className="overflow-x-auto border-t-4 border-t-brand-500 rounded-md bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Identificador</TableHead>
                  <TableHead className="text-center">Tipo de Receita</TableHead>
                  <TableHead className="text-center">Competência</TableHead>
                  <TableHead className="text-center">Data</TableHead>
                  <TableHead className="text-center">Valor</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="font-medium text-center">{income.full_identifier}</TableCell>
                    <TableCell className="text-center">{income.revenue_type}</TableCell>
                    <TableCell className="text-center">{formatCompetency(income.competency)}</TableCell>
                    <TableCell className="text-center">{formatDate(income.revenue_date)}</TableCell>
                    <TableCell className="text-center">{formatCurrency(income.amount)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditIncome(income)}
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
                              <AlertDialogTitle>Excluir receita</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => deleteIncome(income.id)}
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
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border-t-4 border-t-brand-500 rounded-md bg-white dark:bg-gray-900 p-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Nenhuma receita encontrada</h3>
            <p className="text-muted-foreground mt-2 mb-4 max-w-md">
              {searchQuery
                ? "Tente ajustar os filtros da sua busca" 
                : "Você ainda não possui receitas cadastradas"}
            </p>
          </div>
        )}
      </div>

      <Dialog open={openEditIncomeDialog} onOpenChange={setOpenEditIncomeDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <form onSubmit={handleUpdateIncome}>
            <DialogHeader>
              <DialogTitle>Editar Receita</DialogTitle>
              <DialogDescription>
                Altere os dados da receita abaixo
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-identifier" className="text-sm font-medium">Identificador</label>
                <Input 
                  id="edit-identifier" 
                  name="identifier" 
                  required 
                  defaultValue={selectedIncome?.full_identifier}
                  maxLength={22}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-amount" className="text-sm font-medium">Valor (R$)</label>
                <Input 
                  id="edit-amount" 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  required 
                  defaultValue={selectedIncome?.amount}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-date" className="text-sm font-medium">Data</label>
                <Input 
                  id="edit-date" 
                  name="date" 
                  type="date" 
                  required 
                  defaultValue={selectedIncome?.revenue_date}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEditIncomeDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
