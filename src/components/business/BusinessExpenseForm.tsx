
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBusinessExpenses } from '@/hooks/use-business-expenses';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const formSchema = z.object({
  description: z.string().min(3, 'Descrição é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().optional(),
});

type BusinessExpenseFormValues = z.infer<typeof formSchema>;

interface BusinessExpenseFormProps {
  onSuccess: () => void;
}

const categories = [
  'Aluguel',
  'Água',
  'Luz',
  'Internet',
  'Telefone',
  'Material de Escritório',
  'Manutenção',
  'Impostos',
  'Salários',
  'Marketing',
  'Outros'
];

const BusinessExpenseForm: React.FC<BusinessExpenseFormProps> = ({ onSuccess }) => {
  const { addExpense } = useBusinessExpenses();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BusinessExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const onSubmit = async (data: BusinessExpenseFormValues) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      await addExpense({
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date,
        notes: data.notes || '',
      });
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error adding expense:', error);
      setFormError(error instanceof Error ? error.message : 'Erro ao adicionar despesa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 mb-4">
            {formError}
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Descrição da despesa" {...field} />
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
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  placeholder="0,00" 
                  {...field} 
                  onChange={(e) => {
                    // Allow only numbers and commas
                    const value = e.target.value.replace(/[^0-9,]/g, '');
                    field.onChange(value);
                  }}
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
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações adicionais" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BusinessExpenseForm;
