
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Form validation schema
export const residentSchema = z.object({
  id: z.string().optional(),
  matricula: z.string(),
  nome_completo: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(11, "CPF deve ter 11 dígitos"),
  telefone: z.string().min(11, "Telefone deve ter 11 dígitos").max(11, "Telefone deve ter 11 dígitos"),
  email: z.string().email("E-mail inválido"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
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
}

export const useResidents = () => {
  const { user } = useApp();
  const matricula = user?.matricula || '';
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const queryClient = useQueryClient();

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
      
      return data as Resident[];
    },
    enabled: !!matricula
  });

  // Mutation to create a new resident
  const createMutation = useMutation({
    mutationFn: async (values: ResidentFormValues) => {
      // Fixed: Ensure the values submitted match the required field structure
      const resident: Resident = {
        matricula: values.matricula,
        nome_completo: values.nome_completo,
        cpf: values.cpf,
        telefone: values.telefone,
        email: values.email,
        unidade: values.unidade,
        valor_condominio: values.valor_condominio
      };
      
      const { data, error } = await supabase
        .from('residents')
        .insert(resident)
        .select();
      
      if (error) {
        if (error.code === '23505' && error.message.includes('unique_cpf_per_condominium')) {
          throw new Error('CPF já cadastrado para este condomínio');
        } else if (error.code === '23505' && error.message.includes('unique_unit_per_condominium')) {
          throw new Error('Unidade já cadastrada para este condomínio');
        } else {
          console.error("Error creating resident:", error);
          throw error;
        }
      }
      
      return data?.[0] as Resident;
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
      
      const { id, ...updateData } = values;
      
      // Fixed: Ensure required fields are properly typed
      const resident: Omit<Resident, 'id'> = {
        matricula: updateData.matricula,
        nome_completo: updateData.nome_completo,
        cpf: updateData.cpf,
        telefone: updateData.telefone,
        email: updateData.email,
        unidade: updateData.unidade,
        valor_condominio: updateData.valor_condominio
      };
      
      const { data, error } = await supabase
        .from('residents')
        .update(resident)
        .eq('id', id)
        .select();
      
      if (error) {
        if (error.code === '23505' && error.message.includes('unique_cpf_per_condominium')) {
          throw new Error('CPF já cadastrado para este condomínio');
        } else if (error.code === '23505' && error.message.includes('unique_unit_per_condominium')) {
          throw new Error('Unidade já cadastrada para este condomínio');
        } else {
          console.error("Error updating resident:", error);
          throw error;
        }
      }
      
      return data?.[0] as Resident;
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
    isLoading,
    error,
    editingResident,
    setEditingResident,
    resetForm,
    onSubmit,
    deleteResident: deleteMutation.mutate,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch
  };
};
