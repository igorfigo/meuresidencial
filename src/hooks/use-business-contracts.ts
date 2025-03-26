
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

// Contract type definition
export interface BusinessContract {
  id: string;
  title: string;
  counterparty: string;
  type: string;
  start_date: string;
  end_date: string;
  value: number;
  status: 'active' | 'pending' | 'expired' | 'draft';
}

// Contract attachment type definition
export interface ContractAttachment {
  id: string;
  contract_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

export function useBusinessContracts() {
  const queryClient = useQueryClient();
  
  // Helper function to correctly compare dates without timezone issues
  const normalizeDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };
  
  // Fetch contracts from Supabase
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['business-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_contracts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching contracts:', error);
        toast.error('Erro ao carregar contratos');
        throw error;
      }
      
      // Check for expired contracts and update their status
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight to compare dates only
      
      const updatedContracts = data.map(contract => {
        const endDate = normalizeDate(contract.end_date);
        if (endDate < today && contract.status === 'active') {
          return { ...contract, status: 'expired' };
        }
        return contract;
      });
      
      // Update any contracts that have expired
      const expiredContracts = updatedContracts.filter(
        (contract, index) => contract.status === 'expired' && data[index].status !== 'expired'
      );
      
      if (expiredContracts.length > 0) {
        // Update expired contracts in the database
        for (const contract of expiredContracts) {
          await supabase
            .from('business_contracts')
            .update({ status: 'expired' })
            .eq('id', contract.id);
        }
      }
      
      return updatedContracts as BusinessContract[];
    }
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (newContract: Omit<BusinessContract, 'id'>) => {
      const { data, error } = await supabase
        .from('business_contracts')
        .insert([newContract])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating contract:', error);
        toast.error('Erro ao criar contrato');
        throw error;
      }
      
      return data as BusinessContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-contracts'] });
    }
  });

  // Update contract mutation
  const updateContractMutation = useMutation({
    mutationFn: async ({ id, contract }: { id: string, contract: Partial<BusinessContract> }) => {
      const { data, error } = await supabase
        .from('business_contracts')
        .update(contract)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating contract:', error);
        toast.error('Erro ao atualizar contrato');
        throw error;
      }
      
      return data as BusinessContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-contracts'] });
    }
  });

  // Delete contract mutation
  const deleteContractMutation = useMutation({
    mutationFn: async (contractId: string) => {
      const { error } = await supabase
        .from('business_contracts')
        .delete()
        .eq('id', contractId);
      
      if (error) {
        console.error('Error deleting contract:', error);
        toast.error('Erro ao excluir contrato');
        throw error;
      }
      
      return contractId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-contracts'] });
    }
  });

  // Get contract attachments - Updated to use the new table name
  const getContractAttachments = async (contractId: string) => {
    const { data, error } = await supabase
      .from('business_contracts_attachments')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching attachments:', error);
      toast.error('Erro ao carregar anexos');
      throw error;
    }
    
    return data as ContractAttachment[];
  };

  // Upload file attachment - Updated to use the new table name
  const uploadAttachment = async (contractId: string, file: File) => {
    try {
      // 1. Upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${contractId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('contract-attachments')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast.error('Erro ao fazer upload do arquivo');
        throw uploadError;
      }
      
      // 2. Create a record in the business_contracts_attachments table
      const { error: attachmentError } = await supabase
        .from('business_contracts_attachments')
        .insert([{
          contract_id: contractId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type
        }]);
      
      if (attachmentError) {
        console.error('Error saving attachment record:', attachmentError);
        toast.error('Erro ao salvar registro do anexo');
        throw attachmentError;
      }
      
      // 3. Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['contract-attachments', contractId] });
      
      toast.success('Anexo adicionado com sucesso');
      return true;
    } catch (error) {
      console.error('Error in uploadAttachment:', error);
      throw error;
    }
  };

  // Delete attachment - Updated to use the new table name
  const deleteAttachment = async (attachment: ContractAttachment) => {
    try {
      // 1. Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('contract-attachments')
        .remove([attachment.file_path]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        toast.error('Erro ao excluir arquivo');
        throw storageError;
      }
      
      // 2. Delete the record from the business_contracts_attachments table
      const { error: recordError } = await supabase
        .from('business_contracts_attachments')
        .delete()
        .eq('id', attachment.id);
      
      if (recordError) {
        console.error('Error deleting attachment record:', recordError);
        toast.error('Erro ao excluir registro do anexo');
        throw recordError;
      }
      
      // 3. Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['contract-attachments', attachment.contract_id] });
      
      toast.success('Anexo excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Error in deleteAttachment:', error);
      throw error;
    }
  };

  // Get public URL for a file
  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('contract-attachments')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const createContract = async (newContract: Omit<BusinessContract, 'id'>) => {
    return createContractMutation.mutateAsync(newContract);
  };

  const updateContract = async (id: string, contract: Partial<BusinessContract>) => {
    return updateContractMutation.mutateAsync({ id, contract });
  };

  const deleteContract = async (contractId: string) => {
    return deleteContractMutation.mutateAsync(contractId);
  };

  return {
    contracts,
    isLoading,
    createContract,
    updateContract,
    deleteContract,
    getContractAttachments,
    uploadAttachment,
    deleteAttachment,
    getFileUrl
  };
}
