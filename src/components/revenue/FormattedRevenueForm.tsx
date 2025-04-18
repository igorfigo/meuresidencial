
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { useApp } from '@/contexts/AppContext';

interface FormData {
  date_created: string;
  identifier: string;
  amount: string;
}

export function FormattedRevenueForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const { user } = useApp();

  const parseIdentifier = (identifier: string) => {
    // Ignore first two characters (MR)
    const relevant = identifier.substring(2);
    
    // Extract matricula (next 11 characters)
    const matricula = relevant.substring(0, 11);
    
    // Extract revenue type (next 3 characters)
    const revenueType = relevant.substring(11, 14);
    
    // Extract competency (last 6 characters)
    const competency = relevant.substring(14, 20);
    
    return {
      matricula,
      revenueType,
      competency
    };
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      const { matricula, revenueType, competency } = parseIdentifier(data.identifier);
      
      const payload = {
        date_created: data.date_created,
        raw_identifier: data.identifier,
        amount: parseFloat(data.amount.replace(',', '.')),
        matricula,
        revenue_type: revenueType,
        competency
      };
      
      console.log('Submitting formatted revenue with payload:', payload);
      
      // Usar o cliente Supabase normal que respeita as RLS policies
      const { data: insertedData, error } = await supabase
        .from('formatted_revenues')
        .insert(payload)
        .select();

      if (error) {
        console.error('Error submitting revenue:', error);
        throw new Error(`Database error: ${error.message || 'Unknown error'}`);
      }

      console.log('Revenue inserted successfully:', insertedData);
      toast.success('Receita cadastrada com sucesso!');
      reset();
    } catch (error: any) {
      console.error('Error submitting revenue:', error);
      toast.error(`Erro ao cadastrar receita: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date_created">Data da Receita</Label>
          <Input
            id="date_created"
            type="date"
            {...register('date_created', { required: 'Data é obrigatória' })}
          />
          {errors.date_created && (
            <p className="text-sm text-red-500">{errors.date_created.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="identifier">Identificador</Label>
          <Input
            id="identifier"
            type="text"
            placeholder="MR58037313151MES042025"
            {...register('identifier', {
              required: 'Identificador é obrigatório',
              pattern: {
                value: /^MR\d{11}[A-Z]{3}\d{6}$/,
                message: 'Formato inválido. Ex: MR58037313151MES042025'
              }
            })}
          />
          {errors.identifier && (
            <p className="text-sm text-red-500">{errors.identifier.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Formato: MR + matrícula (11 dígitos) + tipo (3 letras) + competência (042025)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="text"
            placeholder="0,00"
            {...register('amount', {
              required: 'Valor é obrigatório',
              pattern: {
                value: /^\d+([.,]\d{1,2})?$/,
                message: 'Formato inválido. Ex: 100,00'
              }
            })}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full mt-4 py-2 text-base font-medium"
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Receita'}
        </Button>
      </form>
    </Card>
  );
}
