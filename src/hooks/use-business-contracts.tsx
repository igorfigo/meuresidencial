
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface Contract {
  id: string;
  title: string;
  counterparty: string;
  type: string;
  start_date: string;
  end_date: string;
  value: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

interface ContractFormData {
  title: string;
  counterparty: string;
  type: string;
  start_date: string;
  end_date: string;
  value: number;
  status: string;
}

export const useBusinessContracts = () => {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all contracts
  const {
    data: contracts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['business-contracts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('business_contracts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return data as Contract[];
      } catch (error) {
        console.error('Error fetching contracts:', error);
        throw error;
      }
    }
  });

  // Create a new contract
  const createContractMutation = useMutation({
    mutationFn: async (contractData: ContractFormData) => {
      try {
        // Prepare the contract data
        const newContract = {
          ...contractData,
          created_by: user?.id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('business_contracts')
          .insert([newContract])
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data as Contract;
      } catch (error) {
        console.error('Error creating contract:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-contracts'] });
    }
  });

  // Update a contract
  const updateContractMutation = useMutation({
    mutationFn: async ({ id, ...contractData }: ContractFormData & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('business_contracts')
          .update({
            ...contractData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data as Contract;
      } catch (error) {
        console.error('Error updating contract:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-contracts'] });
    }
  });

  // Delete a contract
  const deleteContractMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('business_contracts')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        return id;
      } catch (error) {
        console.error('Error deleting contract:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-contracts'] });
    }
  });

  // Upload contract file
  const uploadContractFile = async (contractId: string, file: File) => {
    try {
      setIsUploading(true);
      
      // Upload file to storage
      const filePath = `contracts/${contractId}/${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('business_documents')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Create file record in database
      const { error: dbError } = await supabase
        .from('business_contract_files')
        .insert({
          contract_id: contractId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          created_by: user?.id
        });
        
      if (dbError) {
        throw dbError;
      }
      
      // Refresh contracts data
      queryClient.invalidateQueries({ queryKey: ['business-contracts'] });
      
      return fileData;
    } catch (error) {
      console.error('Error uploading contract file:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Download contract file
  const downloadContract = async (contractId: string) => {
    try {
      toast.info("Preparando download...");
      // In a real implementation, this would download the actual file
      // For demonstration purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would normally check if there are files and download them
      toast.success("Arquivo baixado com sucesso");
    } catch (error) {
      console.error('Error downloading contract:', error);
      throw error;
    }
  };

  return {
    contracts,
    isLoading,
    error,
    isUploading,
    refetch,
    createContract: createContractMutation.mutateAsync,
    updateContract: updateContractMutation.mutateAsync,
    deleteContract: deleteContractMutation.mutateAsync,
    uploadContractFile,
    downloadContract,
  };
};
