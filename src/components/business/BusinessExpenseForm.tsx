
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Calendar, FileText, Info } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrencyInput } from '@/utils/currency';

const businessExpenseCategories = [
  { value: 'salarios', label: 'Salários' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'equipamentos', label: 'Equipamentos' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'viagem', label: 'Viagem' },
  { value: 'impostos', label: 'Impostos' },
  { value: 'software', label: 'Software' },
  { value: 'treinamento', label: 'Treinamento' },
  { value: 'outros', label: 'Outros' }
];

const businessExpenseSchema = z.object({
  category: z.string().min(1, { message: 'Categoria é obrigatória' }),
  amount: z.string().min(1, { message: 'Valor é obrigatório' }),
  description: z.string().min(1, { message: 'Descrição é obrigatória' }),
  payment_date: z.string().min(1, { message: 'Data de pagamento é obrigatória' }),
  observations: z.string().optional()
});

export interface BusinessExpense {
  id?: string;
  category: string;
  amount: string;
  description: string;
  payment_date: string;
  observations?: string;
}

interface BusinessExpenseFormProps {
  onSubmit: (data: BusinessExpense) => Promise<void>;
  initialData?: BusinessExpense;
}

export const BusinessExpenseForm = ({ onSubmit, initialData }: BusinessExpenseFormProps) => {
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof businessExpenseSchema>>({
    resolver: zodResolver(businessExpenseSchema),
    defaultValues: initialData || {
      category: '',
      amount: '',
      description: '',
      payment_date: '',
      observations: ''
    }
  });
  
  const handleSubmit = async (values: z.infer<typeof businessExpenseSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          ...values,
          category: values.category,
          amount: values.amount,
          description: values.description,
          payment_date: values.payment_date,
          observations: values.observations,
          id: initialData?.id
        }
      );
      
      if (!initialData) {
        form.reset({
          category: '',
          amount: '',
          description: '',
          payment_date: '',
          observations: ''
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Category Field */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-medium text-base">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-600">
                    <FileText className="h-4 w-4" />
                  </span>
                  Categoria*
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businessExpenseCategories.map(category => (
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
          
          {/* Amount Field */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-medium text-base">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-600">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  Valor*
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0,00"
                    isCurrency
                    className="h-12"
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
          
          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-medium text-base">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-600">
                    <Info className="h-4 w-4" />
                  </span>
                  Descrição*
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Descrição da despesa"
                    className="h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Payment Date Field */}
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-medium text-base">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-600">
                    <Calendar className="h-4 w-4" />
                  </span>
                  Data de Pagamento*
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Observations Field */}
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-medium text-base">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-600">
                    <FileText className="h-4 w-4" />
                  </span>
                  Observações
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações sobre esta despesa"
                    className="min-h-[120px] resize-none"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-12 px-6"
            >
              {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
