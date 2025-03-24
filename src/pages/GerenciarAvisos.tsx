
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useNews, NewsItem } from '@/hooks/use-news';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Edit, Bell, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { AdminOnly } from '@/components/AdminOnly';

export default function GerenciarAvisos() {
  const { newsItems, isLoading, fetchNewsItems, addNewsItem, updateNewsItemStatus, deleteNewsItem } = useNews();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    full_content: '',
    is_active: true
  });

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const handleAddItem = async () => {
    if (!formData.title || !formData.short_description || !formData.full_content) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
      });
      return;
    }

    const success = await addNewsItem(formData);
    if (success) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem) return;
    
    if (!formData.title || !formData.short_description || !formData.full_content) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
      });
      return;
    }

    const { data, error } = await supabase
      .from('news_items')
      .update({
        title: formData.title,
        short_description: formData.short_description,
        full_content: formData.full_content,
        is_active: formData.is_active
      })
      .eq('id', selectedItem.id)
      .select();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: error.message,
      });
      return;
    }

    toast({
      title: 'Aviso atualizado',
      description: 'O aviso foi atualizado com sucesso!',
    });
    
    setIsEditDialogOpen(false);
    fetchNewsItems();
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    const success = await deleteNewsItem(selectedItem.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const handleToggleStatus = async (item: NewsItem) => {
    await updateNewsItemStatus(item.id, !item.is_active);
  };

  const openEditDialog = (item: NewsItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      short_description: item.short_description,
      full_content: item.full_content,
      is_active: item.is_active
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: NewsItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      short_description: '',
      full_content: '',
      is_active: true
    });
  };

  return (
    <AdminOnly>
      <DashboardLayout>
        <div className="flex flex-col gap-6 animate-fade-in">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gerenciar Avisos</h1>
              <p className="text-muted-foreground">
                Crie e gerencie avisos para os gestores de condomínios
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Aviso
            </Button>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-brand-600" />
                Lista de Avisos
              </CardTitle>
              <CardDescription>
                Você possui {newsItems.length} avisos cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-24 bg-gray-100 rounded-md"></div>
                  ))}
                </div>
              ) : newsItems.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem avisos</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comece criando um novo aviso para os gestores.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {newsItems.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-md p-4 ${
                        item.is_active ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.title}</h3>
                            {item.is_active ? (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                Ativo
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                                Inativo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(item.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                          </p>
                          <p className="mt-2 text-sm">{item.short_description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(item)}
                            title={item.is_active ? "Desativar" : "Ativar"}
                          >
                            {item.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(item)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(item)}
                            title="Excluir"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Announcement Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Aviso</DialogTitle>
              <DialogDescription>
                Crie um novo aviso para os gestores de condomínios
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Título *
                </label>
                <Input
                  id="title"
                  placeholder="Digite o título do aviso"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="short_description" className="text-sm font-medium">
                  Descrição Curta *
                </label>
                <Input
                  id="short_description"
                  placeholder="Digite uma breve descrição"
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="full_content" className="text-sm font-medium">
                  Conteúdo Completo *
                </label>
                <Textarea
                  id="full_content"
                  placeholder="Digite o conteúdo completo do aviso"
                  rows={5}
                  value={formData.full_content}
                  onChange={(e) =>
                    setFormData({ ...formData, full_content: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddItem}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Announcement Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Aviso</DialogTitle>
              <DialogDescription>
                Atualize as informações do aviso
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-title" className="text-sm font-medium">
                  Título *
                </label>
                <Input
                  id="edit-title"
                  placeholder="Digite o título do aviso"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-short_description" className="text-sm font-medium">
                  Descrição Curta *
                </label>
                <Input
                  id="edit-short_description"
                  placeholder="Digite uma breve descrição"
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-full_content" className="text-sm font-medium">
                  Conteúdo Completo *
                </label>
                <Textarea
                  id="edit-full_content"
                  placeholder="Digite o conteúdo completo do aviso"
                  rows={5}
                  value={formData.full_content}
                  onChange={(e) =>
                    setFormData({ ...formData, full_content: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditItem}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </AdminOnly>
  );
}
