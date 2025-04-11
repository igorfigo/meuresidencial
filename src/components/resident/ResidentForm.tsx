
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResidentFormValues } from '@/hooks/use-residents';
import { formatToBRL } from '@/utils/currency';

interface ResidentFormProps {
  form: any;
  onSubmit: (data: ResidentFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export const ResidentForm = ({
  form,
  onSubmit,
  isSubmitting,
  isEditing,
  onCancel
}: ResidentFormProps) => {
  const formattedCurrency = (value: string) => {
    // Ensure currency values always have the R$ prefix
    if (value && !value.startsWith('R$')) {
      return `R$ ${value}`;
    }
    return value || 'R$ 0,00';
  };

  // Add custom onChange handler for currency field
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: any) => {
    // First let the default handler run
    onChange(e);
    
    // Then ensure the value starts with R$
    const value = e.target.value;
    if (!value.startsWith('R$')) {
      e.target.value = formattedCurrency(value);
    }
  };

  // Add custom onChange handler for unit field to prevent spaces
  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: any) => {
    // Remove any spaces from the input
    const value = e.target.value.replace(/\s+/g, '');
    e.target.value = value;
    onChange(e);
  };

  return (
    <Card className="w-full border-t-4 border-t-brand-600 shadow-md">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Morador' : 'Cadastrar Novo Morador'}</CardTitle>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="matricula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula do Condomínio</FormLabel>
                  <FormControl>
                    <Input {...field} disabled placeholder="Matrícula" className="bg-gray-100" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nome_completo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome completo do morador" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>CPF</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="CPF do morador" 
                      maxLength={11}
                      numberOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Telefone do morador" 
                      maxLength={11}
                      numberOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>E-mail</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E-mail do morador" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Unidade (Número do Apto)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Número do apartamento/unidade" 
                      onChange={(e) => handleUnitChange(e, field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="valor_condominio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Condomínio</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="R$ 0,00" 
                      isCurrency
                      value={formattedCurrency(field.value)}
                      onChange={(e) => {
                        // Make sure our currency format is correct
                        handleCurrencyChange(e, field.onChange);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Se o morador for isento de pagamento, deixe o valor zerado (R$ 0,00).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-brand-600 hover:bg-brand-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Cadastrar')}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
};
