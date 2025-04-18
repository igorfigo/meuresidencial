
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formSchema = z.object({
  systemCode: z.string().length(2, 'Código do sistema deve ter 2 caracteres'),
  matricula: z.string().length(11, 'Matrícula deve ter 11 caracteres'),
  revenueType: z.string().length(3, 'Tipo de receita deve ter 3 caracteres'),
  competency: z.string().length(6, 'Competência deve ter 6 caracteres (MMAAAA)'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  revenue_date: z.date({
    required_error: "Data da receita é obrigatória",
  }),
});

export const FormattedRevenueForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemCode: 'MR',
      matricula: '',
      revenueType: 'MES',
      competency: '',
      amount: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formattedDate = format(values.revenue_date, 'yyyy-MM-dd');
      const fullIdentifier = `${values.systemCode}${values.matricula}${values.revenueType}${values.competency}`;
      
      const { error } = await supabase
        .from('formatted_revenues')
        .insert({
          system_code: values.systemCode,
          matricula: values.matricula,
          revenue_type: values.revenueType,
          competency: values.competency,
          full_identifier: fullIdentifier,
          amount: values.amount,
          revenue_date: formattedDate,
        });

      if (error) {
        console.error('Error inserting formatted revenue:', error);
        throw error;
      }

      toast.success('Receita cadastrada com sucesso!');
      form.reset();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao cadastrar receita. Por favor, tente novamente.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="systemCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código do Sistema</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="MR" 
                    maxLength={2}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="matricula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="58037313151" 
                    maxLength={11}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="revenueType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Receita</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="MES" 
                    maxLength={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="competency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Competência (MMAAAA)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="042025" 
                    maxLength={6}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input 
                  placeholder="R$ 0,00" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="revenue_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data da Receita</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
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
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Cadastrar Receita
        </Button>
      </form>
    </Form>
  );
};
