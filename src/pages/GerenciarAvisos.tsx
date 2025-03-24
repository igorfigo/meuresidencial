
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useNewsItems, NewsItem } from '@/hooks/use-news-items';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertDialog, 
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GerenciarAvisos: React.FC = () => {
  const { newsItems, isLoading, error, createNewsItem, updateNewsItem, removeNewsItem } = useNewsItems();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [currentNewsId, setCurrentNewsId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleNewNews = () => {
    setTitle('');
    setShortDescription('');
    setFullContent('');
    setIsActive(true);
    setCurrentNewsId(null);
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleEditNews = (news: NewsItem) => {
    setTitle(news.title);
    setShortDescription(news.short_description);
    setFullContent(news.full_content);
    setIsActive(news.is_active || true);
    setCurrentNewsId(news.id);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleDeleteClick = (id: string) => {
    setCurrentNewsId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (currentNewsId) {
      try {
        await removeNewsItem(currentNewsId);
        toast({
          title: "Sucesso",
          description: "Aviso excluído com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao excluir o aviso",
          variant: "destructive"
        });
      }
      setShowDeleteDialog(false);
    }
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O título é obrigatório",
        variant: "destructive"
      });
      return false;
    }
    
    if (!shortDescription.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "A descrição breve é obrigatória",
        variant: "destructive"
      });
      return false;
    }
    
    if (!fullContent.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O conteúdo completo é obrigatório",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      const newsData = {
        id: currentNewsId || undefined,
        title,
        short_description: shortDescription,
        full_content: fullContent,
        is_active: isActive
      };
      
      if (isEditing && currentNewsId) {
        await updateNewsItem({ ...newsData, id: currentNewsId });
        toast({
          title: "Sucesso",
          description: "Aviso atualizado com sucesso",
        });
      } else {
        await createNewsItem(newsData);
        toast({
          title: "Sucesso",
          description: "Aviso criado com sucesso",
        });
      }
      
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar o aviso",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Avisos</h1>
            <p className="text-muted-foreground">
              Adicione e gerencie avisos para todos os gestores do sistema.
            </p>
          </div>
          {!isFormVisible && (
            <Button onClick={handleNewNews} className="bg-brand-600 hover:bg-brand-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Aviso
            </Button>
          )}
        </div>
        
        <div className="border-t pt-6">
          {isFormVisible ? (
            <Card className="border-t-4 border-t-brand-600 shadow-md">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-medium">Título</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título do aviso"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shortDescription" className="font-medium">Descrição Breve</Label>
                  <Input
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Breve descrição do aviso"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullContent" className="font-medium">Conteúdo Completo</Label>
                  <Textarea
                    id="fullContent"
                    value={fullContent}
                    onChange={(e) => setFullContent(e.target.value)}
                    placeholder="Conteúdo completo do aviso"
                    className="h-[200px] resize-none w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isActive" 
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(checked as boolean)}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Ativo</Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    onClick={handleSave} 
                    className="gap-2 bg-blue-500 hover:bg-blue-600"
                  >
                    Salvar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleCancelForm}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-t-4 border-t-brand-600 shadow-md">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary m-auto"></div>
                    <p className="mt-4 text-gray-500">Carregando avisos...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                  <p className="text-red-600">{error}</p>
                  <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : newsItems.length === 0 ? (
                <div className="bg-muted/30 border border-muted rounded-lg p-8 text-center">
                  <p className="text-muted-foreground mb-4">Nenhum aviso encontrado.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsItems.map((news) => (
                      <TableRow key={news.id}>
                        <TableCell className="font-medium">{news.title}</TableCell>
                        <TableCell>{news.created_at ? formatDate(news.created_at) : '-'}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            news.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {news.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditNews(news)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => news.id && handleDeleteClick(news.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default GerenciarAvisos;
