
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
} from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResidentFormValues } from '@/hooks/use-residents';

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
  return (
    <Card className="w-full">
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
                  <FormLabel>Nome Completo *</FormLabel>
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
                  <FormLabel>CPF *</FormLabel>
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
                  <FormLabel>Telefone *</FormLabel>
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
                  <FormLabel>E-mail *</FormLabel>
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
                  <FormLabel>Unidade (Número do Apto) *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Número do apartamento/unidade" />
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
                  <FormLabel>Valor do Condomínio *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Valor do condomínio" 
                      isCurrency
                    />
                  </FormControl>
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
