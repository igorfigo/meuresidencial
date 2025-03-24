
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Edit, Trash2, MessageSquare, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NewsItem {
  id?: string;
  title: string;
  short_description: string;
  full_content: string;
  is_active?: boolean;
  created_at?: string;
}

const GerenciarAvisos = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NewsItem>({
    title: '',
    short_description: '',
    full_content: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const fetchNewsItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewsItems(data || []);
    } catch (error) {
      console.error('Error fetching news items:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as novidades',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openNewItemDialog = () => {
    setFormData({
      title: '',
      short_description: '',
      full_content: ''
    });
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const openEditItemDialog = (item: NewsItem) => {
    setFormData({
      title: item.title,
      short_description: item.short_description,
      full_content: item.full_content
    });
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (item: NewsItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.title || !formData.short_description || !formData.full_content) {
        toast({
          title: 'Campos incompletos',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive',
        });
        return;
      }
      
      if (selectedItem?.id) {
        // Update
        const { error } = await supabase
          .from('news_items')
          .update({
            title: formData.title,
            short_description: formData.short_description,
            full_content: formData.full_content,
          })
          .eq('id', selectedItem.id);

        if (error) throw error;
        
        toast({
          title: 'Atualizado',
          description: 'Novidade atualizada com sucesso',
        });
      } else {
        // Create
        const { error } = await supabase
          .from('news_items')
          .insert([
            {
              title: formData.title,
              short_description: formData.short_description,
              full_content: formData.full_content,
              is_active: true,
            }
          ]);

        if (error) throw error;
        
        toast({
          title: 'Adicionado',
          description: 'Novidade adicionada com sucesso',
        });
      }
      
      setIsDialogOpen(false);
      fetchNewsItems();
    } catch (error) {
      console.error('Error saving news item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a novidade',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem?.id) return;
    
    try {
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;
      
      toast({
        title: 'Removido',
        description: 'Novidade removida com sucesso',
      });
      
      setIsDeleteDialogOpen(false);
      fetchNewsItems();
    } catch (error) {
      console.error('Error deleting news item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a novidade',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Avisos</h1>
            <p className="text-muted-foreground">
              Cadastre novidades que serão exibidas para todos os gestores.
            </p>
          </div>
          <Button onClick={openNewItemDialog} className="bg-brand-600 hover:bg-brand-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Novidade
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Carregando...</p>
          ) : newsItems.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhuma novidade cadastrada ainda.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            newsItems.map(item => (
              <Card key={item.id} className="overflow-hidden border-t-4 border-t-brand-600 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditItemDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDeleteDialog(item)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    Publicado em: {formatDate(item.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 items-center text-sm text-muted-foreground mb-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Descrição breve</span>
                  </div>
                  <p className="text-sm">{item.short_description}</p>
                  
                  <div className="flex space-x-2 items-center text-sm text-muted-foreground mt-4 mb-2">
                    <FileText className="h-4 w-4" />
                    <span>Conteúdo completo</span>
                  </div>
                  <p className="text-sm line-clamp-3">{item.full_content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Editar Novidade' : 'Nova Novidade'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para {selectedItem ? 'atualizar esta' : 'criar uma nova'} novidade.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveItem}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Título*
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Título da novidade"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="short_description" className="text-sm font-medium">
                  Descrição Breve*
                </label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  placeholder="Uma breve descrição que será exibida no card"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="full_content" className="text-sm font-medium">
                  Conteúdo Completo*
                </label>
                <Textarea
                  id="full_content"
                  name="full_content"
                  value={formData.full_content}
                  onChange={handleInputChange}
                  placeholder="Conteúdo completo que será exibido ao clicar no card"
                  className="min-h-[150px]"
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a novidade "{selectedItem?.title}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GerenciarAvisos;
