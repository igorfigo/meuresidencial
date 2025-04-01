
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useApp } from '@/contexts/AppContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { formatToBRL, BRLToNumber } from '@/utils/currency';

const incomeFormSchema = z.object({
  amount: z.string().min(1, 'Valor é obrigatório'),
  reference_month: z.string().min(1, 'Mês de referência é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  unit: z.string().optional(),
  payment_date: z.string().optional(),
  observations: z.string().optional(),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

interface IncomeFormProps {
  onSubmit: (data: any) => void;
  initialValues?: any;
  isLoading?: boolean;
}

type UnitOption = {
  value: string;
  label: string;
};

export const IncomeForm: React.FC<IncomeFormProps> = ({ onSubmit, initialValues, isLoading }) => {
  const { user } = useApp();
  const matricula = user?.selectedCondominium || user?.matricula || '';
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openUnitCombobox, setOpenUnitCombobox] = useState(false);
  
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      amount: initialValues?.amount || '',
      reference_month: initialValues?.reference_month || format(new Date(), 'yyyy-MM'),
      category: initialValues?.category || '',
      unit: initialValues?.unit || '',
      payment_date: initialValues?.payment_date || '',
      observations: initialValues?.observations || '',
    },
  });

  // Fetch units from residents table
  useEffect(() => {
    const fetchUnits = async () => {
      if (!matricula) return;
      
      try {
        const { data, error } = await supabase
          .from('residents')
          .select('unidade')
          .eq('matricula', matricula)
          .order('unidade');
        
        if (error) throw error;
        
        const uniqueUnits = [...new Set(data.map(item => item.unidade))];
        const formattedUnits: UnitOption[] = uniqueUnits.map(unit => ({
          value: unit,
          label: unit,
        }));
        
        setUnits(formattedUnits);
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };
    
    fetchUnits();
  }, [matricula]);

  const handleSubmit = (data: IncomeFormValues) => {
    // Format amount to store in the database
    const formattedData = {
      ...data,
      amount: data.amount.startsWith('R$') ? data.amount : `R$ ${formatToBRL(parseFloat(data.amount.replace(/[^\d,.-]/g, '').replace(',', '.')))}`
    };
    
    onSubmit({
      ...formattedData,
      matricula,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    if (value) {
      const numeric = parseInt(value, 10) / 100;
      form.setValue('amount', `R$ ${formatToBRL(numeric)}`);
    } else {
      form.setValue('amount', '');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onChange={handleAmountChange} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reference_month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mês de Referência</FormLabel>
                <FormControl>
                  <Input
                    type="month"
                    {...field}
                    placeholder="YYYY-MM"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Categoria da receita"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade (opcional)</FormLabel>
                <FormControl>
                  <Popover open={openUnitCombobox} onOpenChange={setOpenUnitCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openUnitCombobox}
                        className="w-full justify-between"
                      >
                        {field.value
                          ? units.find((unit) => unit.value === field.value)?.label
                          : "Selecione uma unidade..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar unidade..." />
                        <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
                        <CommandGroup>
                          {units.map((unit) => (
                            <CommandItem
                              key={unit.value}
                              value={unit.value}
                              onSelect={(currentValue) => {
                                field.onChange(currentValue);
                                setOpenUnitCombobox(false);
                              }}
                            >
                              {unit.label}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  field.value === unit.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Pagamento (opcional)</FormLabel>
                <FormControl>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                          setOpenCalendar(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Observações sobre a receita"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Receita"}
        </Button>
      </form>
    </Form>
  );
};
