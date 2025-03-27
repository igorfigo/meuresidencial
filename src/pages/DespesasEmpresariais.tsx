
import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { BusinessExpenseForm, BusinessExpense } from '@/components/business/BusinessExpenseForm';
import { BusinessExpensesList } from '@/components/business/BusinessExpensesList';
import { useBusinessExpenses } from '@/hooks/use-business-expenses';
import { supabase } from '@/integrations/supabase/client';

const DespesasEmpresariais = () => {
  const { user } = useApp();
  const { addExpense, editExpense, isLoading } = useBusinessExpenses();
  
  const handleExpenseSubmit = async (data: BusinessExpense, attachments?: File[]) => {
    try {
      if (data.id) {
        // Edit existing expense
        await editExpense(data);
      } else {
        // Add new expense
        const result = await addExpense(data);
        
        // Upload attachments if provided
        if (attachments && attachments.length > 0 && result && result.length > 0) {
          const expenseId = result[0]?.id;
          
          if (expenseId) {
            // Upload each attachment to storage
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
              
              // Save attachment info to the database
              // @ts-ignore - using string table name which is valid but TypeScript doesn't know about the new table
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
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Lista de Despesas</h2>
            <BusinessExpensesList />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Nova Despesa</h2>
            <BusinessExpenseForm onSubmit={handleExpenseSubmit} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DespesasEmpresariais;
