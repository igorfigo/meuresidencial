
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CommonAreaReservationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  commonAreaId: string | undefined;
  onReservationComplete: () => void;
  onOpenChange?: (open: boolean) => void;
}

export const CommonAreaReservationDialog: React.FC<CommonAreaReservationDialogProps> = ({
  open,
  setOpen,
  commonAreaId,
  onReservationComplete,
  onOpenChange,
}) => {
  const { user } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const residentId = user?.residentId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  
  // Fetch existing reservations for this common area
  useEffect(() => {
    async function fetchExistingReservations() {
      if (!commonAreaId) return;
      
      try {
        const { data, error } = await supabase
          .from('common_area_reservations')
          .select('reservation_date')
          .eq('common_area_id', commonAreaId);
        
        if (error) throw error;
        
        // Convert reservation dates to Date objects for the calendar
        const reservedDates = data?.map(reservation => {
          return new Date(reservation.reservation_date);
        }) || [];
        
        setDisabledDates(reservedDates);
      } catch (error: any) {
        console.error('Error fetching existing reservations:', error);
      }
    }
    
    if (open && commonAreaId) {
      fetchExistingReservations();
    }
  }, [commonAreaId, open]);

  // Check if the date is already reserved
  const checkDateAvailability = async (selectedDate: Date): Promise<boolean> => {
    if (!commonAreaId) return true;
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('common_area_reservations')
        .select('*')
        .eq('common_area_id', commonAreaId)
        .eq('reservation_date', formattedDate);
      
      if (error) throw error;
      
      // If we have data, the date is already reserved
      return data.length === 0;
    } catch (error: any) {
      console.error('Error checking date availability:', error);
      return false;
    }
  };

  // When submitting a reservation form
  const onSubmit = async (data: any) => {
    if (!residentId || !commonAreaId || !date) {
      toast({
        title: "Dados incompletos para reserva",
      });
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    
    try {
      // Format the date for database storage (YYYY-MM-DD)
      const formattedDate = format(data.date, 'yyyy-MM-dd');
      
      // Check if the date is already reserved
      const isAvailable = await checkDateAvailability(data.date);
      
      if (!isAvailable) {
        setValidationError("Esta área já está reservada para o dia selecionado.");
        setIsSubmitting(false);
        return;
      }

      // Insert reservation into database
      const { error } = await supabase
        .from('common_area_reservations')
        .insert({
          common_area_id: commonAreaId,
          resident_id: residentId,
          reservation_date: formattedDate,
        });

      if (error) throw error;

      // Invalidate and refetch the reservations query to update the UI
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });

      toast({
        title: 'Reserva criada com sucesso!',
        variant: 'default',
      });
      onReservationComplete();
      setOpen(false);
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: `Erro ao criar reserva: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    // Reset validation error when dialog closes
    if (!newOpen) {
      setValidationError(null);
    }
  };

  // Handler for date selection
  const handleDateSelect = async (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setValidationError(null);
    
    if (selectedDate) {
      const isAvailable = await checkDateAvailability(selectedDate);
      if (!isAvailable) {
        setValidationError("Esta área já está reservada para o dia selecionado.");
      }
    }
  };

  // Determine if a date should be disabled
  const isDateDisabled = (date: Date) => {
    // Disable dates in the past
    if (date < new Date()) return true;
    
    // Check if the date is in the disabledDates array
    return disabledDates.some(disabledDate => 
      disabledDate.getFullYear() === date.getFullYear() &&
      disabledDate.getMonth() === date.getMonth() &&
      disabledDate.getDate() === date.getDate()
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Agendar Reserva</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione a data desejada para a reserva.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={
                  "w-[240px] justify-start text-left font-normal" +
                  (date ? " text-brand-800" : " text-muted-foreground")
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolher Data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {validationError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onSubmit({ date: date })}
            disabled={isSubmitting || !date || validationError !== null}
          >
            {isSubmitting ? 'Agendando...' : 'Agendar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
