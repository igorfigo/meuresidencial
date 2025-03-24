
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { FileEdit } from 'lucide-react';

interface NewsFormValues {
  title: string;
  short_description: string;
  full_content: string;
}

const CadastrarNovidade = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<NewsFormValues>({
    defaultValues: {
      title: '',
      short_description: '',
      full_content: ''
    }
  });

  const onSubmit = async (values: NewsFormValues) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('news_items')
        .insert([
          {
            title: values.title,
            short_description: values.short_description,
            full_content: values.full_content,
            is_active: true
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Novidade cadastrada com sucesso!",
        variant: "default",
      });
      
      form.reset();
    } catch (error) {
      console.error('Erro ao cadastrar novidade:', error);
      toast({
        title: "Erro",
        description: "Falha ao cadastrar novidade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cadastrar Novidade</h1>
            <p className="text-muted-foreground">
              Cadastre novidades que serão exibidas para todos os gestores
            </p>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5" />
              Nova Novidade
            </CardTitle>
            <CardDescription>
              Preencha os campos abaixo para cadastrar uma nova novidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite o título da novidade" 
                          {...field} 
                          required
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Breve</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite uma descrição curta (será exibida no card)" 
                          {...field}
                          required
                          disabled={isLoading}
                          rows={3}
                          maxLength={200}
                        />
                      </FormControl>
                      <FormDescription>
                        Máximo de 200 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="full_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo Completo</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite o conteúdo completo da novidade" 
                          {...field}
                          required
                          disabled={isLoading}
                          rows={10}
                        />
                      </FormControl>
                      <FormDescription>
                        Este conteúdo será exibido quando o usuário clicar no card
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Salvando..." : "Salvar Novidade"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CadastrarNovidade;
