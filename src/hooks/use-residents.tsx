
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlans } from './use-plans';

// Form validation schema
export const residentSchema = z.object({
  id: z.string().optional(),
  matricula: z.string(),
  nome_completo: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  telefone: z.string().length(11, "Telefone deve ter 11 dígitos"),
  email: z.string().email("E-mail inválido"),
  unidade: z.string()
    .min(1, "Unidade é obrigatória")
    .refine(value => !/\s/.test(value), "Unidade não pode conter espaços"),
  valor_condominio: z.string().min(1, "Valor do condomínio é obrigatório"),
});

export type ResidentFormValues = z.infer<typeof residentSchema>;

// Interface for resident data
export interface Resident {
  id?: string;
  matricula: string;
  nome_completo: string;
  cpf: string;
  telefone: string;
  email: string;
  unidade: string;
  valor_condominio: string;
  created_at?: string;
  updated_at?: string;
  active: boolean;
}

export const useResidents = () => {
  const { user } = useApp();
  const matricula = user?.matricula || '';
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const queryClient = useQueryClient();
  const { plans, isLoading: isLoadingPlans } = usePlans();
  const [planLimitError, setPlanLimitError] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      matricula: matricula,
      nome_completo: '',
      cpf: '',
      telefone: '',
      email: '',
      unidade: '',
      valor_condominio: '',
    }
  });

  // Reset form to default values or to values of resident being edited
  const resetForm = (resident?: Resident) => {
    if (resident) {
      form.reset({
        id: resident.id,
        matricula: matricula,
        nome_completo: resident.nome_completo,
        cpf: resident.cpf,
        telefone: resident.telefone || '',
        email: resident.email || '',
        unidade: resident.unidade,
        valor_condominio: resident.valor_condominio || '',
      });
      setEditingResident(resident);
    } else {
      form.reset({
        matricula: matricula,
        nome_completo: '',
        cpf: '',
        telefone: '',
        email: '',
        unidade: '',
        valor_condominio: '',
      });
      setEditingResident(null);
    }
  };

  // Query to fetch all residents for the current condominium
  // Updated to order by unidade in ascending order
  const { data: residents, isLoading, error, refetch } = useQuery({
    queryKey: ['residents', matricula],
    queryFn: async () => {
      if (!matricula) return [];
      
      const { data, error } = await supabase
        .from('residents')
        .select('*')
        .eq('matricula', matricula)
        .order('unidade', { ascending: true }); // Changed from nome_completo to unidade
      
      if (error) {
        console.error("Error fetching residents:", error);
        toast.error("Erro ao carregar moradores");
        throw error;
      }
      
      // Make sure to cast and ensure the 'active' property exists
      return (data as any[]).map(item => ({
        ...item,
        active: item.active !== undefined ? item.active : true
      })) as Resident[];
    },
    enabled: !!matricula
  });

  // Helper function to check resident count against plan limit
  const checkPlanResidentLimit = async (): Promise<boolean> => {
    if (!matricula) return false;

    try {
      // Get current condominium data to check plan
      const { data: condominiumData, error: condoError } = await supabase
        .from('condominiums')
        .select('planocontratado')
        .eq('matricula', matricula)
        .single();
      
      if (condoError) {
        console.error("Error fetching condominium data:", condoError);
        return false;
      }

      const planCode = condominiumData?.planocontratado;
      if (!planCode) return false;

      // Find plan details to get max_moradores
      const selectedPlan = plans.find(p => p.codigo === planCode);
      if (!selectedPlan || !selectedPlan.max_moradores) return false;

      // Get current resident count
      const { count, error: countError } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('matricula', matricula);
      
      if (countError) {
        console.error("Error counting residents:", countError);
        return false;
      }

      const currentCount = count || 0;
      
      // If editing an existing resident, we're not adding to the count
      if (editingResident) {
        return true;
      }
      
      // Check if adding a new resident would exceed the limit
      if (currentCount >= selectedPlan.max_moradores) {
        setPlanLimitError(`Limite de moradores atingido (${currentCount}/${selectedPlan.max_moradores}). 
        Faça upgrade do seu plano para cadastrar mais moradores.`);
        return false;
      }

      setPlanLimitError(null);
      return true;
    } catch (error) {
      console.error("Error checking plan limit:", error);
      return false;
    }
  };

  // Helper function to check for duplicate unit in the condominium
  const checkDuplicateUnit = async (unidade: string, residentId?: string): Promise<boolean> => {
    // Skip check if no unidade or matricula
    if (!unidade || !matricula) return false;

    let query = supabase
      .from('residents')
      .select('id')
      .eq('matricula', matricula)
      .eq('unidade', unidade);

    // If we're editing an existing resident, exclude it from the check
    if (residentId) {
      query = query.neq('id', residentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error checking duplicate unit:", error);
      return false;
    }

    // Return true if there's at least one resident with the same unit
    return data.length > 0;
  };

  // Mutation to create a new resident
  const createMutation = useMutation({
    mutationFn: async (values: ResidentFormValues) => {
      // Check plan limit first
      const isPlanLimitOk = await checkPlanResidentLimit();
      if (!isPlanLimitOk) {
        throw new Error(planLimitError || 'Limite de moradores atingido para o plano atual');
      }
      
      // Check for duplicate unit before creating
      const isDuplicateUnit = await checkDuplicateUnit(values.unidade);
      if (isDuplicateUnit) {
        throw new Error('Unidade já cadastrada para este condomínio');
      }
      
      // Fixed: Ensure the values submitted match the required field structure
      const resident: Omit<Resident, 'id' | 'created_at' | 'updated_at'> = {
        matricula: values.matricula,
        nome_completo: values.nome_completo,
        cpf: values.cpf,
        telefone: values.telefone,
        email: values.email,
        unidade: values.unidade,
        valor_condominio: values.valor_condominio,
        active: true
      };
      
      const { data, error } = await supabase
        .from('residents')
        .insert(resident)
        .select();
      
      if (error) {
        if (error.code === '23505' && error.message.includes('unique_cpf_per_condominium')) {
          throw new Error('CPF já cadastrado para este condomínio');
        } else {
          console.error("Error creating resident:", error);
          throw error;
        }
      }
      
      // Make sure the returned data has the 'active' property
      return {
        ...(data?.[0] || {}),
        active: data?.[0]?.active !== undefined ? data[0].active : true
      } as Resident;
    },
    onSuccess: () => {
      toast.success("Morador cadastrado com sucesso!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['residents', matricula] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao cadastrar morador");
    }
  });

  // Mutation to update an existing resident
  const updateMutation = useMutation({
    mutationFn: async (values: ResidentFormValues) => {
      if (!values.id) throw new Error("ID do morador não encontrado");
      
      // Check for duplicate unit before updating
      const isDuplicateUnit = await checkDuplicateUnit(values.unidade, values.id);
      if (isDuplicateUnit) {
        throw new Error('Unidade já cadastrada para este condomínio');
      }
      
      const { id, ...updateData } = values;
      
      // Ensure required fields are properly typed and include the active status
      // Use the current active status from the editingResident
      const resident = {
        matricula: updateData.matricula,
        nome_completo: updateData.nome_completo,
        cpf: updateData.cpf,
        telefone: updateData.telefone,
        email: updateData.email,
        unidade: updateData.unidade,
        valor_condominio: updateData.valor_condominio,
        active: editingResident?.active !== undefined ? editingResident.active : true
      };
      
      const { data, error } = await supabase
        .from('residents')
        .update(resident)
        .eq('id', id)
        .select();
      
      if (error) {
        if (error.code === '23505' && error.message.includes('unique_cpf_per_condominium')) {
          throw new Error('CPF já cadastrado para este condomínio');
        } else {
          console.error("Error updating resident:", error);
          throw error;
        }
      }
      
      // Make sure the returned data has the 'active' property
      return {
        ...(data?.[0] || {}),
        active: data?.[0]?.active !== undefined ? data[0].active : true
      } as Resident;
    },
    onSuccess: () => {
      toast.success("Morador atualizado com sucesso!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['residents', matricula] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar morador");
    }
  });

  // Mutation to delete a resident
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting resident:", error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      toast.success("Morador excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['residents', matricula] });
    },
    onError: () => {
      toast.error("Erro ao excluir morador");
    }
  });

  // Mutation to toggle resident active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string, active: boolean }) => {
      const { data, error } = await supabase
        .from('residents')
        .update({ active })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error toggling resident active status:", error);
        throw error;
      }
      
      // Make sure the returned data has the 'active' property
      return {
        ...(data?.[0] || {}),
        active: data?.[0]?.active !== undefined ? data[0].active : active
      } as Resident;
    },
    onSuccess: (data) => {
      const statusText = data.active ? "ativado" : "desativado";
      toast.success(`Morador ${statusText} com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['residents', matricula] });
    },
    onError: () => {
      toast.error("Erro ao alterar status do morador");
    }
  });

  // Handle form submission
  const onSubmit = (values: ResidentFormValues) => {
    if (editingResident) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return {
    form,
    residents,
    isLoading: isLoading || isLoadingPlans,
    error,
    editingResident,
    setEditingResident,
    resetForm,
    onSubmit,
    deleteResident: deleteMutation.mutate,
    toggleResidentActive: (id: string, active: boolean) => toggleActiveMutation.mutate({ id, active }),
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingActive: toggleActiveMutation.isPending,
    refetch,
    planLimitError
  };
};
