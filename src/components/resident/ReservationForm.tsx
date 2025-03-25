
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ReservationFormValues } from '@/hooks/use-resident-common-areas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface ReservationFormProps {
  form: UseFormReturn<ReservationFormValues>;
  onSubmit: (data: ReservationFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  selectedArea: any;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  form,
  onSubmit,
  onCancel,
  isSubmitting,
  selectedArea
}) => {
  return (
    <Card className="border-t-4 border-t-brand-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Solicitar Reserva</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-sm">
              <p className="font-semibold">Área selecionada: {selectedArea?.name}</p>
              {selectedArea?.opening_time && selectedArea?.closing_time && (
                <p className="text-muted-foreground">
                  Horário de funcionamento: {selectedArea.opening_time} às {selectedArea.closing_time}
                </p>
              )}
              {selectedArea?.capacity && (
                <p className="text-muted-foreground">
                  Capacidade máxima: {selectedArea.capacity} pessoas
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="reservation_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Reserva</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="Data da reserva"
                      min={new Date().toISOString().split('T')[0]}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Início</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="Horário de início"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Término</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="Horário de término"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Alguma observação sobre a reserva"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <input type="hidden" {...form.register('common_area_id')} />

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-600 hover:bg-brand-700 sm:order-2"
              >
                {isSubmitting ? 'Enviando...' : 'Solicitar Reserva'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
