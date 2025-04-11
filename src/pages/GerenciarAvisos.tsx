import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Separator } from '@/components/ui/separator';

interface NewsItem {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  is_active: boolean;
  created_at: string;
}

const GerenciarAvisos = () => {
  const { user } = useApp();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      title: '',
      short_description: '',
      full_content: ''
    }
  });

  useEffect(() => {
    fetchNewsItems();
  }, []);

  useEffect(() => {
    if (currentItem && isEditing) {
      form.reset({
        title: currentItem.title,
        short_description: currentItem.short_description,
        full_content: currentItem.full_content
      });
    }
  }, [currentItem, isEditing, form]);

  const fetchNewsItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setNewsItems(data || []);
    } catch (error) {
      console.error('Error fetching news items:', error);
      toast.error('Erro ao carregar as novidades');
    } finally {
      setIsLoading(false);
    }
  };

  const updateActiveStatus = async (newItemId?: string) => {
    try {
      const { error: deactivateError } = await supabase
        .from('news_items')
        .update({ is_active: false })
        .not('id', 'eq', newItemId || '');
      
      if (deactivateError) throw deactivateError;
      
      if (newItemId) {
        const { error: activateError } = await supabase
          .from('news_items')
          .update({ is_active: true })
          .eq('id', newItemId);
        
        if (activateError) throw activateError;
      } else {
        const { data: latestItems, error: fetchError } = await supabase
          .from('news_items')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (fetchError) throw fetchError;
        
        if (latestItems && latestItems.length > 0) {
          const { error: activateLatestError } = await supabase
            .from('news_items')
            .update({ is_active: true })
            .eq('id', latestItems[0].id);
          
          if (activateLatestError) throw activateLatestError;
        }
      }
    } catch (error) {
      console.error('Error updating active status:', error);
      toast.error('Erro ao atualizar status ativo das novidades');
    }
  };

  const onSubmit = async (values: { title: string; short_description: string; full_content: string }) => {
    try {
      setIsLoading(true);
      
      if (isEditing && currentItem) {
        const { data, error } = await supabase
          .from('news_items')
          .update({
            title: values.title,
            short_description: values.short_description,
            full_content: values.full_content
          })
          .eq('id', currentItem.id)
          .select();

        if (error) throw error;
        
        await updateActiveStatus();
        
        toast.success('Novidade atualizada com sucesso!');
      } else {
        const { data, error } = await supabase
          .from('news_items')
          .insert([
            {
              title: values.title,
              short_description: values.short_description,
              full_content: values.full_content,
              is_active: true
            }
          ])
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          await updateActiveStatus(data[0].id);
        }
        
        toast.success('Novidade cadastrada com sucesso!');
      }

      form.reset({
        title: '',
        short_description: '',
        full_content: ''
      });
      setIsEditing(false);
      setCurrentItem(null);
      
      fetchNewsItems();
    } catch (error) {
      console.error('Error saving news item:', error);
      toast.error('Erro ao salvar a novidade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentItem) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', currentItem.id);
      
      if (error) throw error;
      
      toast.success('Novidade excluída com sucesso!');
      setDeleteDialogOpen(false);
      setCurrentItem(null);
      
      await updateActiveStatus();
      
      fetchNewsItems();
    } catch (error) {
      console.error('Error deleting news item:', error);
      toast.error('Erro ao excluir a novidade');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentItem(null);
    form.reset({
      title: '',
      short_description: '',
      full_content: ''
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Gerenciar Avisos</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          Crie e gerencie as novidades que serão exibidas para os usuários do sistema.
        </p>
        <Separator className="mb-6" />

        <div className="space-y-4">
          <Card className="border-t-4 border-t-brand-600">
            <CardHeader>
              <CardTitle>{isEditing ? 'Editar Novidade' : 'Nova Novidade'}</CardTitle>
              <CardDescription>
                {isEditing 
                  ? 'Altere os detalhes da novidade selecionada.' 
                  : 'Preencha os campos para adicionar uma nova novidade.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: 'O título é obrigatório' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o título da novidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="short_description"
                    rules={{ required: 'A descrição breve é obrigatória' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Breve</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Descrição curta que aparecerá no card" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="full_content"
                    rules={{ required: 'O conteúdo completo é obrigatório' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conteúdo Completo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detalhes completos que serão exibidos ao clicar no card" 
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    {isEditing && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-brand-600">
            <CardHeader>
              <CardTitle>Histórico de Novidades</CardTitle>
              <CardDescription>
                Todas as novidades cadastradas no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && !isEditing ? (
                <div className="py-8 text-center">Carregando...</div>
              ) : newsItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead className="text-center">Data</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="text-center">{formatDate(item.created_at)}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(item)}
                              disabled={isEditing}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={isEditing || isDeleting}
                              onClick={() => {
                                setCurrentItem(item);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhuma novidade cadastrada.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
            </DialogHeader>
            <p>
              Tem certeza que deseja excluir a novidade "{currentItem?.title}"?
              Esta ação não pode ser desfeita.
            </p>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GerenciarAvisos;
