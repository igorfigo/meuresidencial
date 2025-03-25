
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

// Schema for reservation form validation
const reservationSchema = z.object({
  common_area_id: z.string().min(1, "Área comum é obrigatória"),
  reservation_date: z.string().min(1, "Data é obrigatória"),
  start_time: z.string().min(1, "Horário de início é obrigatório"),
  end_time: z.string().min(1, "Horário de término é obrigatório"),
  notes: z.string().optional(),
});

export type ReservationFormValues = z.infer<typeof reservationSchema>;

export const useResidentCommonAreas = () => {
  const { user, resident } = useApp();
  const matricula = user?.selectedCondominium || '';
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCommonArea, setSelectedCommonArea] = useState<any>(null);

  // Initialize form with react-hook-form
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      common_area_id: '',
      reservation_date: '',
      start_time: '',
      end_time: '',
      notes: '',
    }
  });

  // Query to fetch all common areas for the selected condominium
  const { data: commonAreas, isLoading: isLoadingAreas } = useQuery({
    queryKey: ['common-areas', matricula],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('common_areas')
        .select('*')
        .eq('matricula', matricula)
        .order('name');
      
      if (error) {
        console.error('Error fetching common areas:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!matricula,
  });

  // Query to fetch resident's reservations
  const { data: myReservations, isLoading: isLoadingReservations, refetch: refetchReservations } = useQuery({
    queryKey: ['my-reservations', resident?.id],
    queryFn: async () => {
      if (!resident?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('common_area_reservations')
        .select(`
          *,
          common_areas:common_area_id (name, opening_time, closing_time)
        `)
        .eq('resident_id', resident.id)
        .order('reservation_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching reservations:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!resident?.id,
  });

  // Mutation to create a new reservation
  const createReservation = useMutation({
    mutationFn: async (formData: ReservationFormValues) => {
      if (!resident?.id) {
        throw new Error("Não foi possível identificar o morador");
      }

      const { data, error } = await supabase
        .from('common_area_reservations')
        .insert({
          common_area_id: formData.common_area_id,
          resident_id: resident.id,
          reservation_date: formData.reservation_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          notes: formData.notes,
          status: 'pending'
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations', resident?.id] });
      form.reset();
      toast.success('Reserva solicitada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error creating reservation:', error);
      toast.error(`Erro ao criar reserva: ${error.message}`);
    }
  });

  // Mutation to cancel a reservation
  const cancelReservation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('common_area_reservations')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('resident_id', resident?.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations', resident?.id] });
      toast.success('Reserva cancelada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error cancelling reservation:', error);
      toast.error(`Erro ao cancelar reserva: ${error.message}`);
    }
  });

  // Handle form submission
  const onSubmit = async (data: ReservationFormValues) => {
    setIsSubmitting(true);
    
    try {
      await createReservation.mutateAsync(data);
    } catch (error) {
      console.error("Error in onSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reservation cancellation
  const onCancelReservation = async (id: string) => {
    setIsDeleting(true);
    
    try {
      await cancelReservation.mutateAsync(id);
    } catch (error) {
      console.error("Error in onCancelReservation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset the form and selected common area
  const resetForm = () => {
    form.reset();
    setSelectedCommonArea(null);
  };

  // Handle common area selection
  const selectCommonArea = (area: any) => {
    setSelectedCommonArea(area);
    form.setValue('common_area_id', area.id);
  };

  return {
    form,
    commonAreas,
    myReservations,
    isLoadingAreas,
    isLoadingReservations,
    isSubmitting,
    isDeleting,
    onSubmit,
    onCancelReservation,
    resetForm,
    selectedCommonArea,
    selectCommonArea,
    refetchReservations
  };
};
