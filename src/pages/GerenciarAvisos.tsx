
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
import { Badge } from '@/components/ui/badge';
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
  const [isCreating, setIsCreating] = useState(false);
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

  // New function to deactivate all news items except the most recent one
  const updateActiveStatus = async (newItemId?: string) => {
    try {
      // First, deactivate all news items
      const { error: deactivateError } = await supabase
        .from('news_items')
        .update({ is_active: false })
        .not('id', 'eq', newItemId || ''); // Skip the new item if it exists
      
      if (deactivateError) throw deactivateError;
      
      // If we have a new item ID, activate just that one
      if (newItemId) {
        const { error: activateError } = await supabase
          .from('news_items')
          .update({ is_active: true })
          .eq('id', newItemId);
        
        if (activateError) throw activateError;
      } else {
        // If no new item ID, activate the most recent one
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
        // Update existing news item
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
        
        // If this is the most recent item, make sure it's active
        await updateActiveStatus();
        
        toast.success('Novidade atualizada com sucesso!');
      } else {
        // Create new news item
        const { data, error } = await supabase
          .from('news_items')
          .insert([
            {
              title: values.title,
              short_description: values.short_description,
              full_content: values.full_content,
              is_active: true // initially set as active
            }
          ])
          .select();

        if (error) throw error;
        
        // Ensure only this new item is active
        if (data && data.length > 0) {
          await updateActiveStatus(data[0].id);
        }
        
        toast.success('Novidade cadastrada com sucesso!');
      }

      // Reset form and state
      form.reset();
      setIsCreating(false);
      setIsEditing(false);
      setCurrentItem(null);
      
      // Refresh news items list
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
      
      // After deleting, ensure the newest remaining item is set to active
      await updateActiveStatus();
      
      fetchNewsItems();
    } catch (error) {
      console.error('Error deleting news item:', error);
      toast.error('Erro ao excluir a novidade');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateNew = () => {
    form.reset({
      title: '',
      short_description: '',
      full_content: ''
    });
    setIsCreating(true);
    setIsEditing(false);
    setCurrentItem(null);
  };

  const handleEdit = (item: NewsItem) => {
    setCurrentItem(item);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setCurrentItem(null);
    form.reset();
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
          <Button 
            onClick={handleCreateNew} 
            className="flex items-center space-x-2"
            disabled={isCreating || isEditing}
          >
            <Plus size={16} />
            <span>Nova Novidade</span>
          </Button>
        </div>
        <p className="text-muted-foreground mb-4">
          Crie e gerencie as novidades que serão exibidas para os usuários do sistema.
        </p>
        <Separator className="mb-6" />

        <div className="space-y-4">
          {(isCreating || isEditing) && (
            <Card>
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
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                      >
                        Cancelar
                      </Button>
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
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Novidades</CardTitle>
              <CardDescription>
                Todas as novidades cadastradas no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && !isCreating && !isEditing ? (
                <div className="py-8 text-center">Carregando...</div>
              ) : newsItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(item)}
                            disabled={isCreating || isEditing}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={isCreating || isEditing || isDeleting}
                            onClick={() => {
                              setCurrentItem(item);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
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
