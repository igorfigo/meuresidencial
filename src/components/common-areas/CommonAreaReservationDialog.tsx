import React, { useState } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast"
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

interface CommonAreaReservationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  commonAreaId: string | undefined;
  onReservationComplete: () => void;
}

export const CommonAreaReservationDialog: React.FC<CommonAreaReservationDialogProps> = ({
  open,
  setOpen,
  commonAreaId,
  onReservationComplete,
}) => {
  const { user } = useApp();
  const { toast } = useToast()
  const residentId = user?.residentId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  // When submitting a reservation form
  const onSubmit = async (data: any) => {
    if (!residentId || !commonAreaId) {
      toast({
        title: "Dados incompletos para reserva",
      })
      return;
    }

    setIsSubmitting(true);
    try {
      // Format the date for database storage (YYYY-MM-DD)
      const formattedDate = format(data.date, 'yyyy-MM-dd');

      // Insert reservation into database
      const { error } = await supabase
        .from('common_area_reservations')
        .insert({
          common_area_id: commonAreaId,
          resident_id: residentId,
          reservation_date: formattedDate,
        });

      if (error) throw error;

      toast.success('Reserva criada com sucesso!');
      onReservationComplete();
      setOpen(false);
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast.error(`Erro ao criar reserva: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
                onSelect={setDate}
                disabled={(date) =>
                  date < new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onSubmit({ date: date })}
            disabled={isSubmitting || !date}
          >
            {isSubmitting ? 'Agendando...' : 'Agendar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
