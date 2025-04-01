
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { FinancialIncome, useFinances } from '@/hooks/use-finances';
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
  payment_date: z.string().min(1, { message: 'Data de recebimento é obrigatória' }),
  unit: z.string().min(1, { message: 'Unidade é obrigatória' }),
  observations: z.string().optional()
});

interface IncomeFormProps {
  onSubmit: (data: FinancialIncome) => Promise<void>;
  initialData?: FinancialIncome;
}

export const IncomeForm = ({ onSubmit, initialData }: IncomeFormProps) => {
  const { user } = useApp();
  const { checkDuplicateIncome } = useFinances();
  const [units, setUnits] = useState<{ value: string; label: string; }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastBalanceAdjustmentDate, setLastBalanceAdjustmentDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<z.infer<typeof incomeSchema> | null>(null);
  const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
  
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
  
  const validatePaymentDate = (paymentDate: string | undefined): boolean => {
    if (!paymentDate || !lastBalanceAdjustmentDate) return true;
    
    const paymentDateObj = new Date(paymentDate);
    const adjustmentDateObj = new Date(lastBalanceAdjustmentDate);
    
    paymentDateObj.setHours(0, 0, 0, 0);
    adjustmentDateObj.setHours(0, 0, 0, 0);
    
    return paymentDateObj >= adjustmentDateObj;
  };
  
  const proceedWithSubmit = async () => {
    if (!user?.selectedCondominium || !pendingSubmitData) return;
    
    setIsSubmitting(true);
    try {
      const incomeData: FinancialIncome = {
        matricula: user.selectedCondominium,
        category: pendingSubmitData.category,
        amount: pendingSubmitData.amount,
        reference_month: pendingSubmitData.reference_month,
        payment_date: pendingSubmitData.payment_date,
        unit: pendingSubmitData.unit,
        observations: pendingSubmitData.observations,
        id: initialData?.id
      };
      
      await onSubmit(incomeData);
      
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
      setPendingSubmitData(null);
    }
  };
  
  const handleSubmit = async (values: z.infer<typeof incomeSchema>) => {
    if (!user?.selectedCondominium) return;
    
    setDateError(null);
    
    if (values.payment_date) {
      // Check that payment date is not after today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const paymentDate = new Date(values.payment_date);
      paymentDate.setHours(0, 0, 0, 0);
      
      if (paymentDate > today) {
        setDateError('A data de recebimento não pode ser posterior à data atual');
        return;
      }
      
      // Also validate against last balance adjustment date
      const isValidDate = validatePaymentDate(values.payment_date);
      
      if (!isValidDate) {
        const adjustmentDate = new Date(lastBalanceAdjustmentDate! + 'T00:00:00');
        const day = adjustmentDate.getDate();
        const month = adjustmentDate.getMonth() + 1;
        const year = adjustmentDate.getFullYear();
        const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
        
        setDateError(`A data de recebimento não pode ser anterior à data do último ajuste de saldo (${formattedDate})`);
        return;
      }
    }
    
    const duplicateIncome = checkDuplicateIncome(values.category, values.reference_month, values.unit);
    
    const isEditingSameIncome = initialData?.id && duplicateIncome?.id === initialData.id;
    
    if (duplicateIncome && !isEditingSameIncome) {
      setPendingSubmitData(values);
      setShowDuplicateDialog(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const incomeData: FinancialIncome = {
        matricula: user.selectedCondominium,
        category: values.category,
        amount: values.amount,
        reference_month: values.reference_month,
        payment_date: values.payment_date,
        unit: values.unit,
        observations: values.observations,
        id: initialData?.id
      };
      
      await onSubmit(incomeData);
      
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
    <>
      <Card className="border-t-4 border-t-green-500 shadow-md">
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
                    <FormLabel required>Categoria</FormLabel>
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
                    <FormLabel required>Valor</FormLabel>
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
                      <FormLabel required>Mês de Referência</FormLabel>
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
                      <FormLabel required>Data de Recebimento</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ''}
                          max={currentDate}
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
                    <FormLabel required>Unidade</FormLabel>
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
                <Button type="submit" variant="income" disabled={isSubmitting || !!dateError}>
                  {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Receita Duplicada</AlertDialogTitle>
            <AlertDialogDescription>
              Já existe uma receita cadastrada para esta categoria, mês de referência e unidade. 
              Deseja continuar mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingSubmitData(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithSubmit}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
