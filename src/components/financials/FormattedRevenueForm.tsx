
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
import { useApp } from '@/contexts/AppContext';

const formSchema = z.object({
  identifier: z.string().min(1, 'Identificador é obrigatório'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  revenue_date: z.date({
    required_error: "Data da receita é obrigatória",
  }),
});

export const FormattedRevenueForm = () => {
  const { user } = useApp();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: '',
      amount: '',
    },
  });

  const parseIdentifier = (identifier: string) => {
    // Expected format: MR58037313151MES042025
    const systemCode = identifier.substring(0, 2); // MR
    const matricula = identifier.substring(2, 13); // 58037313151
    const revenueType = identifier.substring(13, 16); // MES
    const competency = identifier.substring(16); // 042025

    return {
      systemCode,
      matricula,
      revenueType,
      competency,
    };
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const parsedIdentifier = parseIdentifier(values.identifier);
      
      // Format the date as YYYY-MM-DD string for the database
      const formattedDate = format(values.revenue_date, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('formatted_revenues')
        .insert({
          system_code: parsedIdentifier.systemCode,
          matricula: parsedIdentifier.matricula,
          revenue_type: parsedIdentifier.revenueType,
          competency: parsedIdentifier.competency,
          full_identifier: values.identifier,
          amount: values.amount,
          revenue_date: formattedDate, // Use the formatted string date
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
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identificador</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: MR58037313151MES042025" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
