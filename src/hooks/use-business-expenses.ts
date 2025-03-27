import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { BusinessExpense } from '@/components/business/BusinessExpenseForm';

export interface BusinessExpenseWithId extends BusinessExpense {
  id: string;
  created_at?: string;
}

export const useBusinessExpenses = () => {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<BusinessExpenseWithId[]>([]);
  
  const fetchExpenses = async () => {
    if (!user?.isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // @ts-ignore - using string table name which is valid but TypeScript doesn't know about the new table
      const { data, error: fetchError } = await supabase
        .from('business_expenses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        // Check for specific RLS policy error
        if (fetchError.message?.includes('infinite recursion detected in policy')) {
          throw new Error('Erro de permissão: Problema na política de segurança do banco de dados. Por favor, entre em contato com o suporte.');
        }
        throw fetchError;
      }
      
      setExpenses(data as BusinessExpenseWithId[] || []);
    } catch (error: any) {
      console.error('Error fetching business expenses:', error);
      setError(error?.message || 'Erro ao carregar despesas empresariais');
      toast.error('Erro ao carregar despesas empresariais');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.isAdmin) {
      fetchExpenses();
      
      // @ts-ignore - table name is valid but TypeScript doesn't know about the new table
      const channel = supabase
        .channel('business-expenses-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'business_expenses'
        }, () => fetchExpenses())
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.isAdmin]);
  
  const addExpense = async (expense: BusinessExpense) => {
    try {
      // @ts-ignore - using string table name which is valid but TypeScript doesn't know about the new table
      const { data, error: addError } = await supabase
        .from('business_expenses')
        .insert([
          {
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
            payment_date: expense.payment_date,
            observations: expense.observations
          }
        ])
        .select();
      
      if (addError) {
        // Check for specific RLS policy error
        if (addError.message?.includes('infinite recursion detected in policy')) {
          throw new Error('Erro de permissão: Problema na política de segurança do banco de dados. Por favor, entre em contato com o suporte.');
        }
        throw addError;
      }
      
      toast.success('Despesa empresarial adicionada com sucesso');
      return data as BusinessExpenseWithId[];
    } catch (error: any) {
      console.error('Error adding business expense:', error);
      const errorMessage = error?.message || 'Erro ao adicionar despesa empresarial';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  const editExpense = async (expense: BusinessExpense) => {
    if (!expense.id) return null;
    
    try {
      // @ts-ignore - using string table name which is valid but TypeScript doesn't know about the new table
      const { data, error: editError } = await supabase
        .from('business_expenses')
        .update({
          category: expense.category,
          amount: expense.amount,
          description: expense.description,
          payment_date: expense.payment_date,
          observations: expense.observations,
          updated_at: new Date().toISOString()
        })
        .eq('id', expense.id)
        .select();
      
      if (editError) {
        // Check for specific RLS policy error
        if (editError.message?.includes('infinite recursion detected in policy')) {
          throw new Error('Erro de permissão: Problema na política de segurança do banco de dados. Por favor, entre em contato com o suporte.');
        }
        throw editError;
      }
      
      toast.success('Despesa empresarial atualizada com sucesso');
      return data as BusinessExpenseWithId[];
    } catch (error: any) {
      console.error('Error updating business expense:', error);
      const errorMessage = error?.message || 'Erro ao atualizar despesa empresarial';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  const removeExpense = async (id: string) => {
    try {
      // First check if there are attachments to delete
      // @ts-ignore - using string table name which is valid but TypeScript doesn't know about the new table
      const { data: attachments, error: attachmentsError } = await supabase
        .from('business_expense_attachments')
        .select('file_path')
        .eq('expense_id', id);
      
      if (attachmentsError) {
        // Check for specific RLS policy error
        if (attachmentsError.message?.includes('infinite recursion detected in policy')) {
          throw new Error('Erro de permissão: Problema na política de segurança do banco de dados. Por favor, entre em contato com o suporte.');
        }
        throw attachmentsError;
      }
      
      // Delete attachments from storage if they exist
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          await supabase.storage
            .from('attachments')
            .remove([attachment.file_path]);
        }
      }
      
      // Delete attachment records
      // @ts-ignore - using string table name which is valid but TypeScript doesn't know about the new table
      const { error: deleteAttachmentsError } = await supabase
        .from('business_expense_attachments')
        .delete()
        .eq('expense_id', id);
      
      if (deleteAttachmentsError) {
        // Check for specific RLS policy error
        if (deleteAttachmentsError.message?.includes('infinite recursion detected in policy')) {
          throw new Error('Erro de permissão: Problema na política de segurança do banco de dados. Por favor, entre em contato com o suporte.');
        }
        throw deleteAttachmentsError;
      }
      
      // Delete expense
      // @ts-ignore - using string table name which is valid but TypeScript doesn't know about the new table
      const { error: deleteError } = await supabase
        .from('business_expenses')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        // Check for specific RLS policy error
        if (deleteError.message?.includes('infinite recursion detected in policy')) {
          throw new Error('Erro de permissão: Problema na política de segurança do banco de dados. Por favor, entre em contato com o suporte.');
        }
        throw deleteError;
      }
      
      // Update local state
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      toast.success('Despesa empresarial excluída com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error removing business expense:', error);
      const errorMessage = error?.message || 'Erro ao excluir despesa empresarial';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  const saveAttachments = async (expenseId: string, files: File[]) => {
    try {
      for (const file of files) {
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
        
        // @ts-ignore - using string table name which is valid but TypeScript doesn't know about the new table
        await supabase.from('business_expense_attachments').insert({
          expense_id: expenseId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type
        });
      }
      
      toast.success('Comprovantes anexados com sucesso');
    } catch (error) {
      console.error('Error saving attachments:', error);
      toast.error('Erro ao salvar anexos');
    }
  };
  
  const getAttachments = async (expenseId: string) => {
    try {
      // @ts-ignore - using string table name which is valid but TypeScript doesn't know about the new table
      const { data, error } = await supabase
        .from('business_expense_attachments')
        .select('*')
        .eq('expense_id', expenseId);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  };
  
  return {
    isLoading,
    error,
    expenses,
    addExpense,
    editExpense,
    removeExpense,
    refreshData: fetchExpenses,
    saveAttachments,
    getAttachments
  };
};
