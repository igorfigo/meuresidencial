
import { useState } from 'react';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { BusinessExpenseForm, BusinessExpense } from '@/components/business/BusinessExpenseForm';
import { BusinessExpensesList } from '@/components/business/BusinessExpensesList';
import { useBusinessExpenses } from '@/hooks/use-business-expenses';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-mobile';

const DespesasEmpresariais = () => {
  const { user } = useApp();
  const { addExpense, editExpense, isLoading } = useBusinessExpenses();
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const handleExpenseSubmit = async (data: BusinessExpense) => {
    try {
      if (data.id) {
        // Edit existing expense
        await editExpense(data);
      } else {
        // Add new expense
        await addExpense(data);
      }
      
      // Close the form sheet after submitting
      setIsFormSheetOpen(false);
      
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error('Erro ao salvar despesa');
    }
  };
  
  if (!user?.isAdmin) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-700">
              Esta funcionalidade está disponível apenas para administradores.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Despesas Empresariais</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-lg text-gray-500">Carregando dados...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // On mobile, we use a bottom drawer, on desktop we use a side sheet
  const FormContainer = isMobile ? (
    <Drawer open={isFormSheetOpen} onOpenChange={setIsFormSheetOpen}>
      <DrawerTrigger asChild>
        <Button 
          className="gap-2" 
          onClick={() => setIsFormSheetOpen(true)}
        >
          <PlusCircle className="h-5 w-5" />
          Nova Despesa
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-4 pt-4 pb-8">
        <DrawerHeader className="px-0">
          <DrawerTitle>Nova Despesa Empresarial</DrawerTitle>
        </DrawerHeader>
        <div className="p-0 overflow-y-auto max-h-[70vh]">
          <BusinessExpenseForm onSubmit={handleExpenseSubmit} />
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Sheet open={isFormSheetOpen} onOpenChange={setIsFormSheetOpen}>
      <SheetTrigger asChild>
        <Button 
          className="gap-2" 
          onClick={() => setIsFormSheetOpen(true)}
        >
          <PlusCircle className="h-5 w-5" />
          Nova Despesa
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[450px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Nova Despesa Empresarial</SheetTitle>
        </SheetHeader>
        <BusinessExpenseForm onSubmit={handleExpenseSubmit} />
      </SheetContent>
    </Sheet>
  );
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Despesas Empresariais</h1>
            <p className="text-gray-500 mt-1">Gestão de despesas empresariais</p>
          </div>
          <div>
            {FormContainer}
          </div>
        </div>
        
        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Despesas</h2>
          <BusinessExpensesList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DespesasEmpresariais;
