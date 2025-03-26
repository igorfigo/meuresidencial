
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface CommonAreaReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commonArea: {
    id: string;
    name: string;
    valor?: string;
  };
  onSuccess: () => void;
}

const formSchema = z.object({
  reservation_date: z.date({
    required_error: "A data da reserva é obrigatória",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const CommonAreaReservationDialog: React.FC<CommonAreaReservationDialogProps> = ({
  open,
  onOpenChange,
  commonArea,
  onSuccess,
}) => {
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!user?.residentId) {
      toast.error("Você precisa estar logado como morador para fazer uma reserva");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reservationData = {
        common_area_id: commonArea.id,
        resident_id: user.residentId,
        reservation_date: format(data.reservation_date, 'yyyy-MM-dd'),
        status: 'pending',
      };
      
      // Check for existing reservations using any method
      const { data: existingReservations, error: checkError } = await supabase
        .from('common_area_reservations')
        .select('*')
        .eq('common_area_id', commonArea.id)
        .eq('reservation_date', reservationData.reservation_date);
      
      if (checkError) {
        console.error('Error checking existing reservations:', checkError);
        toast.error('Erro ao verificar disponibilidade');
        return;
      }
      
      if (existingReservations && existingReservations.length > 0) {
        toast.error('Esta área já está reservada nesta data. Por favor, escolha outra data.');
        return;
      }
      
      // Create the reservation
      const { error } = await supabase
        .from('common_area_reservations')
        .insert(reservationData);
      
      if (error) {
        console.error('Error creating reservation:', error);
        toast.error(`Erro ao criar reserva: ${error.message}`);
        return;
      }
      
      toast.success('Reserva criada com sucesso!');
      form.reset();
      onSuccess();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error during reservation submission:', error);
      toast.error(`Erro ao processar reserva: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const formatCurrency = (value: string | undefined) => {
    if (!value) return 'Grátis';
    
    // Convert to number, then format
    const numValue = parseFloat(value);
    if (numValue <= 0) return 'Grátis';
    
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reservar Área Comum</DialogTitle>
          <DialogDescription>
            Preencha os dados para reservar {commonArea.name}
            {commonArea.valor && parseFloat(commonArea.valor) > 0 && (
              <span className="ml-1 font-medium text-brand-600">
                ({formatCurrency(commonArea.valor)})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="reservation_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Reserva</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Escolha a data para sua reserva
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-brand-600 hover:bg-brand-700" 
                disabled={isSubmitting}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Reservando...' : 'Confirmar Reserva'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
