
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const useResidentCommonAreas = () => {
  const { user } = useApp();
  const matricula = user?.selectedCondominium || user?.matricula || '';
  
  const [commonAreas, setCommonAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [myReservations, setMyReservations] = useState<any[]>([]);
  
  // Reservation form state
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  
  // Loading states
  const [isReserving, setIsReserving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Fetch common areas
  const fetchCommonAreas = async () => {
    if (!matricula) {
      console.log("No matricula available, cannot fetch common areas");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('common_areas')
        .select('*')
        .eq('matricula', matricula)
        .order('name');
      
      if (error) throw error;
      
      setCommonAreas(data || []);
    } catch (error: any) {
      console.error('Error fetching common areas:', error.message);
      toast.error('Erro ao carregar áreas comuns');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch all reservations for a common area
  const fetchReservations = async (areaId: string) => {
    try {
      const { data, error } = await supabase
        .from('common_area_reservations')
        .select(`
          *,
          residents:resident_id (nome_completo, unidade)
        `)
        .eq('common_area_id', areaId)
        .order('reservation_date', { ascending: false });
      
      if (error) throw error;
      
      setReservations(data || []);
      return data || [];
    } catch (error: any) {
      console.error('Error fetching reservations:', error.message);
      toast.error('Erro ao carregar reservas');
      return [];
    }
  };
  
  // Fetch resident's reservations
  const fetchMyReservations = async () => {
    // Changed to check user.residentId instead of user.id
    if (!user?.residentId) {
      // If residentId is not yet set, try to find it using user_id
      if (user) {
        try {
          const { data: residentData, error: residentError } = await supabase
            .from('residents')
            .select('id')
            .eq('user_id', user.email) // Using email as a fallback, since it's unique
            .single();
          
          if (residentError) throw residentError;
          
          if (residentData) {
            const { data, error } = await supabase
              .from('common_area_reservations')
              .select(`
                *,
                common_areas (name, opening_time, closing_time),
                residents:resident_id (nome_completo, unidade)
              `)
              .eq('resident_id', residentData.id)
              .order('reservation_date', { ascending: false });
            
            if (error) throw error;
            
            setMyReservations(data || []);
          }
        } catch (error: any) {
          console.error('Error fetching resident ID:', error.message);
        }
      }
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('common_area_reservations')
        .select(`
          *,
          common_areas (name, opening_time, closing_time),
          residents:resident_id (nome_completo, unidade)
        `)
        .eq('resident_id', user.residentId)
        .order('reservation_date', { ascending: false });
      
      if (error) throw error;
      
      setMyReservations(data || []);
    } catch (error: any) {
      console.error('Error fetching my reservations:', error.message);
      toast.error('Erro ao carregar suas reservas');
    }
  };
  
  // Create reservation
  const createReservation = async ({ areaId, date, startTime, endTime, notes }: any) => {
    // Check if user exists and has either residentId or email
    if (!user || (!user.residentId && !user.email)) {
      toast.error('Você precisa estar logado para fazer uma reserva');
      return;
    }
    
    setIsReserving(true);
    
    try {
      // Get resident ID
      let residentId = user.residentId;
      
      // If no residentId is available, try to find it using user_id or email
      if (!residentId) {
        const { data: residentData, error: residentError } = await supabase
          .from('residents')
          .select('id, unidade')
          .eq('email', user.email)
          .single();
        
        if (residentError) throw residentError;
        
        if (!residentData) {
          toast.error('Perfil de morador não encontrado');
          return;
        }
        
        residentId = residentData.id;
      }
      
      // Check for scheduling conflicts
      const { data: existingReservations, error: checkError } = await supabase
        .from('common_area_reservations')
        .select('*')
        .eq('common_area_id', areaId)
        .eq('reservation_date', date)
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);
      
      if (checkError) throw checkError;
      
      if (existingReservations && existingReservations.length > 0) {
        toast.error('Já existe uma reserva para este horário');
        setIsReserving(false);
        return;
      }
      
      // Create reservation
      const { data, error } = await supabase
        .from('common_area_reservations')
        .insert({
          common_area_id: areaId,
          resident_id: residentId,
          reservation_date: date,
          start_time: startTime,
          end_time: endTime,
          notes,
          status: 'pending'
        })
        .select();
      
      if (error) throw error;
      
      toast.success('Reserva criada com sucesso!');
      setIsReservationDialogOpen(false);
      fetchMyReservations();
    } catch (error: any) {
      console.error('Error creating reservation:', error.message);
      toast.error('Erro ao criar reserva');
    } finally {
      setIsReserving(false);
    }
  };
  
  // Cancel reservation
  const cancelReservation = async (id: string) => {
    setIsCancelling(true);
    
    try {
      const { error } = await supabase
        .from('common_area_reservations')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Reserva cancelada com sucesso');
      fetchMyReservations();
    } catch (error: any) {
      console.error('Error cancelling reservation:', error.message);
      toast.error('Erro ao cancelar reserva');
    } finally {
      setIsCancelling(false);
    }
  };
  
  // Load data on mount
  useEffect(() => {
    if (matricula) {
      fetchCommonAreas();
      fetchMyReservations();
    }
  }, [matricula, user]);
  
  return {
    commonAreas,
    isLoading,
    selectedDate,
    setSelectedDate,
    selectedArea,
    setSelectedArea,
    reservations,
    myReservations,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    notes,
    setNotes,
    createReservation,
    isReserving,
    isReservationDialogOpen,
    setIsReservationDialogOpen,
    cancelReservation,
    isCancelling,
    fetchReservations
  };
};
