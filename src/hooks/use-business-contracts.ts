
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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

// Mock data for the contracts (would be replaced with API calls)
const mockContracts: BusinessContract[] = [
  {
    id: '1',
    title: 'Contrato de Manutenção',
    counterparty: 'Tech Solutions',
    type: 'service',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    value: 12000,
    status: 'active'
  },
  {
    id: '2',
    title: 'Aluguel de Equipamentos',
    counterparty: 'Equipment Rental Co.',
    type: 'lease',
    start_date: '2023-03-15',
    end_date: '2024-03-14',
    value: 8500,
    status: 'active'
  },
  {
    id: '3',
    title: 'Consultoria Financeira',
    counterparty: 'Finance Experts Inc.',
    type: 'service',
    start_date: '2023-06-01',
    end_date: '2023-07-31',
    value: 6000,
    status: 'expired'
  },
  {
    id: '4',
    title: 'Parceria de Marketing',
    counterparty: 'Marketing Partners',
    type: 'partnership',
    start_date: '2023-09-01',
    end_date: '2024-08-31',
    value: 15000,
    status: 'active'
  },
  {
    id: '5',
    title: 'Serviço de Limpeza',
    counterparty: 'CleanPro Services',
    type: 'service',
    start_date: '2023-07-01',
    end_date: '2024-06-30',
    value: 7200,
    status: 'active'
  }
];

export function useBusinessContracts() {
  const queryClient = useQueryClient();
  
  // Fetch contracts
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['business-contracts'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockContracts;
    }
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (newContract: Omit<BusinessContract, 'id'>) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a mock ID (in a real app, this would come from the backend)
      const id = Math.random().toString(36).substring(2, 11);
      
      return { id, ...newContract };
    },
    onSuccess: (newContract) => {
      queryClient.setQueryData(['business-contracts'], (oldData: BusinessContract[] = []) => {
        return [...oldData, newContract];
      });
    }
  });

  // Download contract (mock function)
  const downloadContractMutation = useMutation({
    mutationFn: async (contractId: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Downloading contract ${contractId}`);
      return true;
    }
  });

  // Delete contract mutation
  const deleteContractMutation = useMutation({
    mutationFn: async (contractId: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return contractId;
    },
    onSuccess: (contractId) => {
      queryClient.setQueryData(['business-contracts'], (oldData: BusinessContract[] = []) => {
        return oldData.filter(contract => contract.id !== contractId);
      });
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
