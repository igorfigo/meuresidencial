
import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { BusinessExpenseForm, BusinessExpense } from '@/components/business/BusinessExpenseForm';
import { BusinessExpensesList } from '@/components/business/BusinessExpensesList';
import { useBusinessExpenses } from '@/hooks/use-business-expenses';
import { supabase } from '@/integrations/supabase/client';

const DespesasEmpresariais = () => {
  const { user } = useApp();
  const { addExpense, editExpense, isLoading } = useBusinessExpenses();
  const [activeTab, setActiveTab] = useState<string>('list');
  
  const handleExpenseSubmit = async (data: BusinessExpense, attachments?: File[]) => {
    try {
      if (data.id) {
        const result = await editExpense(data);
        setActiveTab('list');
        return result;
      } else {
        const result = await addExpense(data);
        
        if (attachments && attachments.length > 0 && result && result.length > 0) {
          const expenseId = result[0]?.id;
          
          if (expenseId) {
            for (const file of attachments) {
              const filename = `${Date.now()}-${file.name}`;
              const filePath = `business-expense-attachments/${expenseId}/${filename}`;
              
              const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file);
              
              if (uploadError) {
                console.error('Error uploading file:', uploadError);
                toast.error(`Erro ao anexar arquivo: ${file.name}`);
                continue;
              }
              
              await supabase.from('business_expense_attachments').insert({
                expense_id: expenseId,
                file_name: file.name,
                file_path: filePath,
                file_type: file.type
              });
            }
            
            toast.success('Comprovantes anexados com sucesso');
          }
        }
        
        setActiveTab('list');
        return result;
      }
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
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Despesas Empresariais</h1>
            <p className="text-gray-500 mt-1">Gestão de despesas empresariais</p>
          </div>
        </div>
        
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="list">Lista de Despesas</TabsTrigger>
            <TabsTrigger value="new">Nova Despesa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            <BusinessExpensesList />
          </TabsContent>
          
          <TabsContent value="new" className="mt-6">
            <BusinessExpenseForm onSubmit={handleExpenseSubmit} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DespesasEmpresariais;
