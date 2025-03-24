
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

export interface NewsItem {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  created_at: string;
  is_active: boolean;
  matricula?: string;
}

export function useNews() {
  const [isLoading, setIsLoading] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const { toast } = useToast();
  const { user } = useApp();

  const fetchNewsItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching news items:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar avisos',
          description: error.message,
        });
        return [];
      }

      setNewsItems(data || []);
      return data;
    } catch (error) {
      console.error('Error in fetchNewsItems:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar avisos',
        description: 'Ocorreu um erro ao buscar os avisos. Tente novamente mais tarde.',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addNewsItem = async (newsItem: Omit<NewsItem, 'id' | 'created_at'>) => {
    try {
      setIsLoading(true);
      
      // Make sure matricula is included if user is admin
      const itemToAdd = user?.isAdmin 
        ? { ...newsItem, matricula: 'admin' }
        : newsItem;
      
      const { data, error } = await supabase
        .from('news_items')
        .insert(itemToAdd)
        .select()
        .single();

      if (error) {
        console.error('Error adding news item:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao adicionar aviso',
          description: error.message,
        });
        return null;
      }

      toast({
        title: 'Aviso adicionado',
        description: 'O aviso foi adicionado com sucesso!',
      });

      setNewsItems(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error in addNewsItem:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar aviso',
        description: 'Ocorreu um erro ao adicionar o aviso. Tente novamente mais tarde.',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNewsItemStatus = async (id: string, isActive: boolean) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('news_items')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        console.error('Error updating news item status:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar aviso',
          description: error.message,
        });
        return false;
      }

      toast({
        title: 'Aviso atualizado',
        description: `O aviso foi ${isActive ? 'ativado' : 'desativado'} com sucesso!`,
      });

      setNewsItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, is_active: isActive } : item
        )
      );
      return true;
    } catch (error) {
      console.error('Error in updateNewsItemStatus:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar aviso',
        description: 'Ocorreu um erro ao atualizar o aviso. Tente novamente mais tarde.',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNewsItem = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting news item:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao excluir aviso',
          description: error.message,
        });
        return false;
      }

      toast({
        title: 'Aviso excluído',
        description: 'O aviso foi excluído com sucesso!',
      });

      setNewsItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error in deleteNewsItem:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir aviso',
        description: 'Ocorreu um erro ao excluir o aviso. Tente novamente mais tarde.',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    newsItems,
    isLoading,
    fetchNewsItems,
    addNewsItem,
    updateNewsItemStatus,
    deleteNewsItem
  };
}
