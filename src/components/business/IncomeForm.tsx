
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBusinessIncomes } from '@/hooks/use-business-incomes';

const formSchema = z.object({
  revenue_date: z.date({
    required_error: "A data é obrigatória",
  }),
  identifier: z.string().min(20, {
    message: "O identificador deve ter pelo menos 20 caracteres",
  }),
  amount: z.string().min(1, {
    message: "O valor é obrigatório",
  }),
});

interface IncomeFormProps {
  onSuccess?: () => void;
}

export function IncomeForm({ onSuccess }: IncomeFormProps) {
  const { createIncome } = useBusinessIncomes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: '',
      amount: '',
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Processar o identificador
      const identifier = values.identifier;
      const system_code = identifier.substring(0, 2);
      const manager_code = identifier.substring(2, 13);
      const revenue_type = identifier.substring(13, 16);
      
      // Extrair a competência dos últimos 6 dígitos (MMAAAA)
      const competencyStr = identifier.substring(identifier.length - 6);
      // Converter para o formato AAAA-MM
      const year = competencyStr.substring(2);
      const month = competencyStr.substring(0, 2);
      const formattedCompetency = `20${year}-${month}-01`;
      
      // Converter a data para string no formato ISO para compatibilidade com o Supabase
      const formattedDate = format(values.revenue_date, 'yyyy-MM-dd');

      await createIncome({
        revenue_date: formattedDate,
        full_identifier: identifier,
        system_code,
        manager_code,
        revenue_type,
        competency: formattedCompetency,
        amount: parseFloat(values.amount)
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao cadastrar receita:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Cadastrar Receita</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identificador</FormLabel>
                <FormControl>
                  <Input placeholder="MR580373131510422025" {...field} />
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
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Cadastrando..." : "Cadastrar Receita"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
