
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import AdminOnly from '@/components/AdminOnly';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { NewsHistory } from '@/components/news/NewsHistory';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Trash } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface NewsFormValues {
  title: string;
  short_description: string;
  full_content: string;
}

interface NewsItem {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  created_at: string;
  is_active: boolean;
}

const CadastrarNovidade = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<NewsFormValues>({
    defaultValues: {
      title: '',
      short_description: '',
      full_content: '',
    },
  });

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const fetchNewsItems = async () => {
    try {
      setIsLoadingNews(true);
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setNewsItems(data || []);
    } catch (error) {
      console.error('Error fetching news items:', error);
      toast.error('Falha ao carregar novidades');
    } finally {
      setIsLoadingNews(false);
    }
  };

  const onSubmit = async (values: NewsFormValues) => {
    try {
      setIsLoading(true);

      // Set all previous news items to inactive
      if (newsItems.length > 0) {
        const { error: updateError } = await supabase
          .from('news_items')
          .update({ is_active: false })
          .eq('is_active', true);
          
        if (updateError) throw updateError;
      }

      // Insert new news item
      const { error } = await supabase
        .from('news_items')
        .insert({
          title: values.title,
          short_description: values.short_description,
          full_content: values.full_content,
          is_active: true,
        });
        
      if (error) throw error;
      
      toast.success('Novidade cadastrada com sucesso!');
      form.reset();
      fetchNewsItems();
    } catch (error) {
      console.error('Error creating news item:', error);
      toast.error('Falha ao cadastrar novidade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', selectedItem.id);
        
      if (error) throw error;
      
      toast.success('Novidade excluída com sucesso!');
      fetchNewsItems();
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting news item:', error);
      toast.error('Falha ao excluir novidade');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (item: NewsItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AdminOnly>
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Cadastrar Novidade</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Nova Novidade</CardTitle>
                <CardDescription>
                  Cadastre uma nova novidade ou anúncio para todos os gestores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                              maxLength={100}
                            />
                          </FormControl>
                          <FormDescription>
                            Máximo de 100 caracteres
                          </FormDescription>
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
                              placeholder="Digite uma descrição breve que aparecerá no card"
                              {...field}
                              required
                              maxLength={200}
                              rows={3}
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
                              rows={7}
                            />
                          </FormControl>
                          <FormDescription>
                            Este texto será exibido ao clicar em "Ler mais"
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? 'Salvando...' : 'Cadastrar Novidade'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Novidades</CardTitle>
                  <CardDescription>
                    Visualize e gerencie novidades existentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingNews ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ) : newsItems.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      Nenhuma novidade cadastrada
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {newsItems.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                        >
                          <div className="flex-1 mr-4">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-gray-500 truncate">{item.short_description}</p>
                          </div>
                          <div className="flex items-center">
                            {item.is_active && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                                Ativo
                              </span>
                            )}
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => confirmDelete(item)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta novidade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminOnly>
  );
};

export default CadastrarNovidade;
