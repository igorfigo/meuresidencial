
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NewsItem {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  created_at: string;
  is_active: boolean;
}

export const useNews = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setNews(data as NewsItem[]);
      return data;
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Falha ao carregar novidades');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const saveNewsItem = async (newsItem: Omit<NewsItem, 'id' | 'created_at'>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news_items')
        .insert([newsItem])
        .select();

      if (error) {
        throw error;
      }

      toast.success('Novidade cadastrada com sucesso!');
      return data[0];
    } catch (error) {
      console.error('Error saving news item:', error);
      toast.error('Falha ao cadastrar novidade');
      return null;
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
        throw error;
      }

      toast.success('Novidade removida com sucesso!');
      return true;
    } catch (error) {
      console.error('Error deleting news item:', error);
      toast.error('Falha ao remover novidade');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    news,
    isLoading,
    fetchNews,
    saveNewsItem,
    deleteNewsItem
  };
};
