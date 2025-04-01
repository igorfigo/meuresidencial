
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '@/contexts/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { FinancialIncome } from '@/hooks/use-finances';
import { formatCurrencyInput } from '@/utils/currency';
import { toast } from 'sonner';

const incomeCategories = [
  { value: 'taxa_condominio', label: 'Taxa de Condomínio' },
  { value: 'reserva_area_comum', label: 'Reserva Área Comum' },
  { value: 'taxa_extra', label: 'Taxa Extra' },
  { value: 'outros', label: 'Outros' }
];

const incomeSchema = z.object({
  category: z.string().min(1, { message: 'Categoria é obrigatória' }),
  amount: z.string().min(1, { message: 'Valor é obrigatório' }),
  reference_month: z.string().min(1, { message: 'Mês de referência é obrigatório' }),
  payment_date: z.string().optional(),
  unit: z.string().min(1, { message: 'Unidade é obrigatória' }),
  observations: z.string().optional()
});

interface IncomeFormProps {
  onSubmit: (data: FinancialIncome) => Promise<void>;
  initialData?: FinancialIncome;
}

export const IncomeForm = ({ onSubmit, initialData }: IncomeFormProps) => {
  const { user } = useApp();
  const [units, setUnits] = useState<{ value: string; label: string; }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [lastBalanceAdjustmentDate, setLastBalanceAdjustmentDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initialData || {
      category: '',
      amount: '',
      reference_month: '',
      payment_date: '',
      unit: '',
      observations: ''
    }
  });

  useEffect(() => {
    const fetchUnits = async () => {
      if (!user?.selectedCondominium) return;
      
      try {
        const { data, error } = await supabase
          .from('residents')
          .select('unidade')
          .eq('matricula', user.selectedCondominium)
          .order('unidade');
        
        if (error) throw error;
        
        const uniqueUnits = [...new Set(data.map(item => item.unidade))];
        setUnits(uniqueUnits.map(unit => ({ value: unit, label: unit })));
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };
    
    const fetchLastBalanceAdjustmentDate = async () => {
      if (!user?.selectedCondominium) return;
      
      try {
        const { data, error } = await supabase
          .from('balance_adjustments')
          .select('adjustment_date')
          .eq('matricula', user.selectedCondominium)
          .order('adjustment_date', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Format as YYYY-MM-DD for comparison with HTML input date format
          const adjustmentDate = new Date(data[0].adjustment_date);
          const formattedDate = adjustmentDate.toISOString().split('T')[0];
          setLastBalanceAdjustmentDate(formattedDate);
        }
      } catch (error) {
        console.error('Error fetching last balance adjustment date:', error);
      }
    };
    
    fetchUnits();
    fetchLastBalanceAdjustmentDate();
  }, [user?.selectedCondominium]);
  
  const checkDuplicateIncome = async (values: z.infer<typeof incomeSchema>) => {
    if (!user?.selectedCondominium || values.category !== 'taxa_condominio') {
      return false; // Only check for duplicates with "Taxa de Condomínio" category
    }
    
    setIsCheckingDuplicate(true);
    try {
      const { data, error } = await supabase
        .from('financial_incomes')
        .select('id')
        .eq('matricula', user.selectedCondominium)
        .eq('category', 'taxa_condominio')
        .eq('unit', values.unit)
        .eq('reference_month', values.reference_month);
        
      if (error) throw error;
      
      const filteredData = initialData?.id 
        ? data.filter(item => item.id !== initialData.id) 
        : data;
        
      return filteredData.length > 0;
    } catch (error) {
      console.error('Error checking duplicate income:', error);
      return false;
    } finally {
      setIsCheckingDuplicate(false);
    }
  };
  
  const validatePaymentDate = (paymentDate: string | undefined): boolean => {
    if (!paymentDate || !lastBalanceAdjustmentDate) return true;
    
    // Create date objects for comparison (ignoring time)
    const paymentDateObj = new Date(paymentDate);
    const adjustmentDateObj = new Date(lastBalanceAdjustmentDate);
    
    // Set both times to midnight to ensure we're only comparing dates
    paymentDateObj.setHours(0, 0, 0, 0);
    adjustmentDateObj.setHours(0, 0, 0, 0);
    
    // Compare the two dates
    return paymentDateObj >= adjustmentDateObj;
  };
  
  const handleSubmit = async (values: z.infer<typeof incomeSchema>) => {
    if (!user?.selectedCondominium) return;
    
    setDateError(null);
    
    // Check if payment date is provided and valid
    if (values.payment_date) {
      const isValidDate = validatePaymentDate(values.payment_date);
      
      if (!isValidDate) {
        // Fix: Create proper date object but avoid timezone issues by adding 
        // the time segment when parsing the date
        const adjustmentDate = new Date(lastBalanceAdjustmentDate! + 'T00:00:00');
        // Format the date correctly
        const day = adjustmentDate.getDate();
        const month = adjustmentDate.getMonth() + 1;
        const year = adjustmentDate.getFullYear();
        const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
        
        setDateError(`A data de recebimento não pode ser anterior à data do último ajuste de saldo (${formattedDate})`);
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      if (values.category === 'taxa_condominio') {
        const isDuplicate = await checkDuplicateIncome(values);
        
        if (isDuplicate) {
          toast.error('Já existe uma Taxa de Condomínio cadastrada para esta unidade e mês de referência');
          setIsSubmitting(false);
          return;
        }
      }
      
      await onSubmit({
        ...values,
        matricula: user.selectedCondominium,
        category: values.category,
        amount: values.amount, 
        reference_month: values.reference_month,
        payment_date: values.payment_date,
        id: initialData?.id
      });
      
      if (!initialData) {
        form.reset({
          category: '',
          amount: '',
          reference_month: '',
          payment_date: '',
          unit: '',
          observations: ''
        });
        setDateError(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md">
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Receita' : 'Nova Receita'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incomeCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0,00"
                      isCurrency
                      onChange={(e) => {
                        const formattedValue = formatCurrencyInput(e.target.value.replace(/\D/g, ''));
                        field.onChange(formattedValue);
                      }}
                      value={field.value ? `R$ ${field.value}` : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reference_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês de Referência*</FormLabel>
                    <FormControl>
                      <Input
                        type="month"
                        {...field}
                      />
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
                    <FormLabel>Data de Recebimento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    {dateError && <p className="text-xs text-destructive mt-1">{dateError}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma unidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre esta receita"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting || isCheckingDuplicate || !!dateError}>
                {isSubmitting ? 'Salvando...' : isCheckingDuplicate ? 'Verificando...' : initialData ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
