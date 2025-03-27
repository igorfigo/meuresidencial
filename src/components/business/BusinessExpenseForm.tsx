
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
import { Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  observations: z.string().optional(),
  attachments: z.instanceof(FileList).optional().transform(files => files ? Array.from(files) : [])
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
  const [attachmentsList, setAttachmentsList] = useState<File[]>([]);
  
  const form = useForm<z.infer<typeof businessExpenseSchema>>({
    resolver: zodResolver(businessExpenseSchema),
    defaultValues: initialData || {
      category: '',
      amount: '',
      description: '',
      payment_date: '',
      observations: '',
      attachments: undefined
    }
  });
  
  const handleSubmit = async (values: z.infer<typeof businessExpenseSchema>) => {
    setIsSubmitting(true);
    try {
      const { attachments, ...expenseData } = values;
      
      await onSubmit(
        {
          ...expenseData,
          category: expenseData.category,
          amount: expenseData.amount,
          description: expenseData.description,
          payment_date: expenseData.payment_date,
          observations: expenseData.observations,
          id: initialData?.id
        },
        attachmentsList.length > 0 ? attachmentsList : undefined
      );
      
      if (!initialData) {
        form.reset({
          category: '',
          amount: '',
          description: '',
          payment_date: '',
          observations: '',
          attachments: undefined
        });
        setAttachmentsList([]);
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
                        onClick={() => document.getElementById('business-file-upload')?.click()}
                        className="w-full"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Anexar Comprovante
                      </Button>
                      <Input
                        id="business-file-upload"
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
