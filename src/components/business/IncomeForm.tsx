
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBusinessIncomes } from '@/hooks/use-business-incomes';

const formSchema = z.object({
  identifier: z.string().min(20, {
    message: "O identificador deve ter pelo menos 20 caracteres",
  }),
  amount: z.string().min(1, {
    message: "O valor é obrigatório",
  }),
  date: z.string().min(1, {
    message: "A data é obrigatória",
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
      date: ''
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
      const month = competencyStr.substring(0, 2);
      const year = competencyStr.substring(2);
      const formattedCompetency = `${year}-${month}-01`;

      await createIncome({
        revenue_date: values.date,
        full_identifier: identifier,
        system_code,
        manager_code,
        revenue_type,
        competency: formattedCompetency,
        amount: parseFloat(values.amount.replace(/[^\d,.-]/g, '').replace(',', '.'))
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="identifier" required>Identificador</Label>
        <Input
          id="identifier"
          {...form.register("identifier")}
          maxLength={22}
        />
        {form.formState.errors.identifier && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.identifier.message}</p>
        )}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="amount" required>Valor (R$)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...form.register("amount")}
        />
        {form.formState.errors.amount && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.amount.message}</p>
        )}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="date" required>Data</Label>
        <Input
          id="date"
          type="date"
          {...form.register("date")}
        />
        {form.formState.errors.date && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.date.message}</p>
        )}
      </div>
      
      <div className="flex justify-end gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
