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
import { Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FinancialExpense } from '@/hooks/use-finances';
import { formatCurrencyInput } from '@/utils/currency';

const expenseCategories = [
  { value: 'energia', label: 'Energia' },
  { value: 'agua', label: 'Água' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'gas', label: 'Gás' },
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'produtos', label: 'Produtos' },
  { value: 'imposto', label: 'Imposto' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'sistema_condominio', label: 'Sistema Condomínio' },
  { value: 'outros', label: 'Outros' }
];

const expenseSchema = z.object({
  category: z.string().min(1, { message: 'Categoria é obrigatória' }),
  amount: z.string().min(1, { message: 'Valor é obrigatório' }),
  reference_month: z.string().min(1, { message: 'Mês de referência é obrigatório' }),
  due_date: z.string().min(1, { message: 'Data de vencimento é obrigatória' }),
  payment_date: z.string().min(1, { message: 'Data de pagamento é obrigatória' }),
  observations: z.string().optional(),
  attachments: z.instanceof(FileList).optional().transform(files => files ? Array.from(files) : [])
});

interface ExpenseFormProps {
  onSubmit: (data: FinancialExpense, attachments?: File[]) => Promise<void>;
  initialData?: FinancialExpense;
}

export const ExpenseForm = ({ onSubmit, initialData }: ExpenseFormProps) => {
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentsList, setAttachmentsList] = useState<File[]>([]);
  const [lastBalanceAdjustmentDate, setLastBalanceAdjustmentDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData || {
      category: '',
      amount: '',
      reference_month: '',
      due_date: '',
      payment_date: '',
      observations: '',
      attachments: undefined
    }
  });

  useEffect(() => {
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
  
  const handleSubmit = async (values: z.infer<typeof expenseSchema>) => {
    if (!user?.selectedCondominium) return;
    
    setDateError(null);
    
    if (values.payment_date) {
      const isValidDate = validatePaymentDate(values.payment_date);
      
      if (!isValidDate) {
        const adjustmentDate = new Date(lastBalanceAdjustmentDate!);
        const formattedDate = adjustmentDate.toLocaleDateString('pt-BR');
        setDateError(`A data de pagamento não pode ser anterior à data do último ajuste de saldo (${formattedDate})`);
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      const { attachments, ...expenseData } = values;
      
      await onSubmit(
        {
          ...expenseData,
          matricula: user.selectedCondominium,
          category: expenseData.category,
          amount: expenseData.amount,
          reference_month: expenseData.reference_month,
          due_date: expenseData.due_date,
          payment_date: expenseData.payment_date,
          id: initialData?.id
        },
        attachmentsList.length > 0 ? attachmentsList : undefined
      );
      
      if (!initialData) {
        form.reset({
          category: '',
          amount: '',
          reference_month: '',
          due_date: '',
          payment_date: '',
          observations: '',
          attachments: undefined
        });
        setAttachmentsList([]);
        setDateError(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachmentsList([...attachmentsList, ...newFiles]);
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachmentsList(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Despesa' : 'Nova Despesa'}</CardTitle>
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
                      {expenseCategories.map(category => (
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento*</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
                    <FormLabel>Data de Pagamento*</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
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
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre esta despesa"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="attachments"
              render={({ field: { ref, ...field } }) => (
                <FormItem>
                  <FormLabel>Anexos</FormLabel>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="w-full"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Anexar Comprovante
                      </Button>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                    </div>
                    
                    {attachmentsList.length > 0 && (
                      <div className="grid gap-2 mt-2">
                        {attachmentsList.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center text-sm">
                              <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="truncate max-w-[200px]">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive h-8 px-2"
                              onClick={() => removeAttachment(index)}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting || !!dateError}>
                {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
