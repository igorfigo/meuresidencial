
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';

// Schema for reservation form validation
const reservationSchema = z.object({
  common_area_id: z.string().min(1, "Área comum é obrigatória"),
  reservation_date: z.date({
    required_error: "Data da reserva é obrigatória",
  }),
  start_time: z.string().min(1, "Horário de início é obrigatório"),
  end_time: z.string().min(1, "Horário de término é obrigatório"),
  notes: z.string().optional(),
});

export type ReservationFormValues = z.infer<typeof reservationSchema>;

export const useResidentCommonAreas = () => {
  const { user } = useApp();
  const matricula = user?.selectedCondominium || '';
  const queryClient = useQueryClient();
  
  const [isReserving, setIsReserving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  
  // Initialize form with react-hook-form
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      common_area_id: '',
      reservation_date: undefined,
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

  // Query to fetch reservations made by the current resident
  const { data: myReservations, isLoading: isLoadingReservations, refetch: refetchReservations } = useQuery({
    queryKey: ['my-reservations', user?.residentId],
    queryFn: async () => {
      if (!user?.residentId) return [];

      const { data, error } = await supabase
        .from('common_area_reservations')
        .select(`
          *,
          common_areas(name)
        `)
        .eq('resident_id', user.residentId)
        .order('reservation_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching my reservations:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!user?.residentId,
  });

  // Query to fetch reservations for a specific common area
  const fetchReservationsForArea = async (commonAreaId: string) => {
    const { data, error } = await supabase
      .from('common_area_reservations')
      .select(`
        *,
        residents:resident_id (nome_completo, unidade)
      `)
      .eq('common_area_id', commonAreaId)
      .gte('reservation_date', format(new Date(), 'yyyy-MM-dd'))
      .order('reservation_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching reservations for area:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  };

  // Reset form to default values or set it to edit an existing reservation
  const resetForm = (areaId?: string) => {
    if (areaId) {
      const area = commonAreas?.find(a => a.id === areaId);
      if (area) {
        setSelectedAreaId(areaId);
        setSelectedArea(area);
        form.reset({
          common_area_id: areaId,
          reservation_date: undefined,
          start_time: area.opening_time || '',
          end_time: area.closing_time || '',
          notes: '',
        });
      }
    } else {
      setSelectedAreaId(null);
      setSelectedArea(null);
      form.reset({
        common_area_id: '',
        reservation_date: undefined,
        start_time: '',
        end_time: '',
        notes: '',
      });
    }
  };

  // Show reservation form for a specific area
  const showReservationForm = (areaId: string) => {
    resetForm(areaId);
    setShowForm(true);
  };

  // Hide reservation form
  const hideReservationForm = () => {
    resetForm();
    setShowForm(false);
  };

  // Submit form to create a reservation
  const createReservation = async (data: ReservationFormValues) => {
    if (!matricula || !user?.residentId) {
      toast.error('Informações do morador indisponíveis');
      return;
    }

    setIsReserving(true);
    
    try {
      // Format date for database
      const formattedDate = format(data.reservation_date, 'yyyy-MM-dd');
      
      // Create new reservation
      const { error } = await supabase
        .from('common_area_reservations')
        .insert({
          resident_id: user.residentId,
          common_area_id: data.common_area_id,
          reservation_date: formattedDate,
          start_time: data.start_time,
          end_time: data.end_time,
          notes: data.notes,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Reserva solicitada com sucesso. Aguarde aprovação.');
      
      // Refresh the data
      await queryClient.invalidateQueries({
        queryKey: ['my-reservations', user.residentId]
      });
      refetchReservations();
      
      // Close the form
      hideReservationForm();
      
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast.error(`Erro ao solicitar reserva: ${error.message}`);
    } finally {
      setIsReserving(false);
    }
  };

  // Cancel a reservation
  const cancelReservation = async (reservationId: string) => {
    if (!reservationId || !user?.residentId) return;

    try {
      const { error } = await supabase
        .from('common_area_reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId)
        .eq('resident_id', user.residentId);

      if (error) throw error;
      
      toast.success('Reserva cancelada com sucesso');
      
      // Refresh the data
      await queryClient.invalidateQueries({
        queryKey: ['my-reservations', user.residentId]
      });
      refetchReservations();
      
    } catch (error: any) {
      console.error('Error canceling reservation:', error);
      toast.error(`Erro ao cancelar reserva: ${error.message}`);
    }
  };

  return {
    form,
    commonAreas,
    isLoadingAreas,
    myReservations,
    isLoadingReservations,
    selectedAreaId,
    selectedArea,
    showForm,
    isReserving,
    showReservationForm,
    hideReservationForm,
    createReservation,
    cancelReservation,
    fetchReservationsForArea,
  };
};
