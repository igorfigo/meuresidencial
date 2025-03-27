
import { useState } from 'react';
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
  onSubmit: (data: BusinessExpense, attachments?: File[]) => Promise<void>;
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
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Despesa Empresarial' : 'Nova Despesa Empresarial'}</CardTitle>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descrição da despesa"
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
                      placeholder="Observações sobre esta despesa"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
