
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

// Schema for common area form validation
const commonAreaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome da área é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  capacity: z.number().int().positive("Capacidade deve ser um número positivo").min(1, "Capacidade é obrigatória"),
  rules: z.string().min(1, "Regras de utilização são obrigatórias"),
  opening_time: z.string().min(1, "Horário de abertura é obrigatório"),
  closing_time: z.string().min(1, "Horário de fechamento é obrigatório"),
  weekdays: z.array(z.string()).optional(),
});

export type CommonAreaFormValues = z.infer<typeof commonAreaSchema>;

export const useCommonAreas = () => {
  const { user } = useApp();
  const matricula = user?.selectedCondominium || user?.matricula || '';
  const queryClient = useQueryClient();
  
  const [editingArea, setEditingArea] = useState<CommonAreaFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<CommonAreaFormValues>({
    resolver: zodResolver(commonAreaSchema),
    defaultValues: {
      name: '',
      description: '',
      capacity: null,
      rules: '',
      opening_time: '',
      closing_time: '',
      weekdays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
    }
  });

  // Query to fetch all common areas for the selected condominium
  const { data: commonAreas, isLoading, refetch } = useQuery({
    queryKey: ['common-areas', matricula],
    queryFn: async () => {
      if (!matricula) {
        console.log('No matricula provided for common areas query');
        return [];
      }
      
      console.log('Fetching common areas for matricula:', matricula);
      const { data, error } = await supabase
        .from('common_areas')
        .select('*')
        .eq('matricula', matricula)
        .order('name');
      
      if (error) {
        console.error('Error fetching common areas:', error);
        throw new Error(error.message);
      }
      
      console.log('Common areas fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!matricula,
  });

  // Query to fetch reservations for a specific common area
  const fetchReservations = async (commonAreaId: string) => {
    const { data, error } = await supabase
      .from('common_area_reservations')
      .select(`
        *,
        residents:resident_id (nome_completo, unidade)
      `)
      .eq('common_area_id', commonAreaId)
      .order('reservation_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching reservations:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  };

  // Reset form to default values or set it to edit an existing area
  const resetForm = (area?: CommonAreaFormValues) => {
    if (area) {
      setEditingArea(area);
      form.reset(area);
    } else {
      setEditingArea(null);
      form.reset({
        name: '',
        description: '',
        capacity: null,
        rules: '',
        opening_time: '',
        closing_time: '',
        weekdays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
      });
    }
  };

  // Submit form to create or update a common area
  const onSubmit = async (data: CommonAreaFormValues) => {
    if (!matricula) {
      toast.error('Nenhum condomínio selecionado');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (data.id) {
        // Update existing common area
        const { error } = await supabase
          .from('common_areas')
          .update({
            name: data.name,
            description: data.description,
            capacity: data.capacity,
            rules: data.rules,
            opening_time: data.opening_time,
            closing_time: data.closing_time,
            weekdays: data.weekdays,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);

        if (error) throw error;
        toast.success('Área comum atualizada com sucesso');
      } else {
        // Create new common area
        const { error } = await supabase
          .from('common_areas')
          .insert({
            matricula,
            name: data.name,
            description: data.description,
            capacity: data.capacity,
            rules: data.rules,
            opening_time: data.opening_time,
            closing_time: data.closing_time,
            weekdays: data.weekdays,
          });

        if (error) throw error;
        toast.success('Área comum cadastrada com sucesso');
      }
      
      // Refresh the data
      await queryClient.invalidateQueries({
        queryKey: ['common-areas', matricula]
      });
      refetch();
      
    } catch (error: any) {
      console.error('Error saving common area:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a common area
  const deleteCommonArea = async (id: string) => {
    if (!id) return;

    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('common_areas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Área comum excluída com sucesso');
      
      // Refresh the data
      await queryClient.invalidateQueries({
        queryKey: ['common-areas', matricula]
      });
      refetch();
      
    } catch (error: any) {
      console.error('Error deleting common area:', error);
      toast.error(`Erro ao excluir: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    form,
    commonAreas,
    isLoading,
    editingArea,
    resetForm,
    onSubmit,
    deleteCommonArea,
    isSubmitting,
    isDeleting,
    fetchReservations,
    refetch,
  };
};
