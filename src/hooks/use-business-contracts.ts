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

export function useBusinessContracts() {
  const queryClient = useQueryClient();
  
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
      
      return data as BusinessContract[];
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

  // Download contract (mock function for now, would be replaced with actual download)
  const downloadContractMutation = useMutation({
    mutationFn: async (contractId: string) => {
      // In a real implementation, this would call a Supabase function or get a storage URL
      // For now, keep the simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Downloading contract ${contractId}`);
      return true;
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

  const createContract = async (newContract: Omit<BusinessContract, 'id'>) => {
    return createContractMutation.mutateAsync(newContract);
  };

  const downloadContract = async (contractId: string) => {
    return downloadContractMutation.mutateAsync(contractId);
  };

  const deleteContract = async (contractId: string) => {
    return deleteContractMutation.mutateAsync(contractId);
  };

  return {
    contracts,
    isLoading,
    createContract,
    downloadContract,
    deleteContract
  };
}
