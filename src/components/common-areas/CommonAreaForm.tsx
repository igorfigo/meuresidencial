
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CommonAreaFormValues } from '@/hooks/use-common-areas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CommonAreaFormProps {
  form: UseFormReturn<CommonAreaFormValues>;
  onSubmit: (values: CommonAreaFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

// Reorder weekday options from Monday to Sunday
const weekdayOptions = [
  { id: 'Segunda', label: 'Segunda-feira' },
  { id: 'Terça', label: 'Terça-feira' },
  { id: 'Quarta', label: 'Quarta-feira' },
  { id: 'Quinta', label: 'Quinta-feira' },
  { id: 'Sexta', label: 'Sexta-feira' },
  { id: 'Sábado', label: 'Sábado' },
  { id: 'Domingo', label: 'Domingo' },
];

export const CommonAreaForm: React.FC<CommonAreaFormProps> = ({
  form,
  onSubmit,
  isSubmitting,
  isEditing,
  onCancel
}) => {
  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Área Comum' : 'Nova Área Comum'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Atualize as informações da área comum do condomínio' 
            : 'Cadastre uma nova área comum para o condomínio'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Área <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Salão de Festas, Piscina, Churrasqueira" />
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
                  <FormLabel>Descrição <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva a área comum"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        placeholder="Número de pessoas"
                        value={field.value || ''} 
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
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
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Reserva (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        isCurrency
                        {...field} 
                        placeholder="R$ 0,00"
                        value={field.value || '0'} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="opening_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Abertura <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
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
                name="closing_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Fechamento <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regras de Utilização <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Regras para utilização desta área"
                      value={field.value || ''}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weekdays"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Dias da Semana Disponíveis</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {weekdayOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="weekdays"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValue, option.id]);
                                    } else {
                                      field.onChange(
                                        currentValue.filter((value) => value !== option.id)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
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
              className="bg-brand-600 hover:bg-brand-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
