
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

export interface NewsItem {
  id?: string;
  title: string;
  short_description: string;
  full_content: string;
  matricula?: string;
  is_active?: boolean;
  created_at?: string;
}

export function useNewsItems() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useApp();
  const isAdmin = user?.isAdmin || false;

  const fetchNewsItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('news_items')
        .select('*');
      
      // Se for admin, busca todos. Se for gestor, filtra apenas os ativos
      if (!isAdmin) {
        query = query.eq('is_active', true);
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setNewsItems(data as NewsItem[] || []);
    } catch (err) {
      console.error("Error fetching news items:", err);
      setError("Falha ao carregar avisos");
      toast({
        title: "Erro",
        description: "Falha ao carregar avisos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewsItem = async (newsData: Omit<NewsItem, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .insert({
          ...newsData,
          matricula: user?.isAdmin ? null : user?.selectedCondominium
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setNewsItems(prev => [data as NewsItem, ...prev]);
      return data;
    } catch (err) {
      console.error("Error creating news item:", err);
      throw err;
    }
  };

  const updateNewsItem = async (newsData: NewsItem) => {
    if (!newsData.id) return null;
    
    try {
      const { id, created_at, ...updateData } = newsData;
      
      const { data, error } = await supabase
        .from('news_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setNewsItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updateData } : item)
      );
      
      return data;
    } catch (err) {
      console.error("Error updating news item:", err);
      throw err;
    }
  };

  const removeNewsItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setNewsItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting news item:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchNewsItems();
  }, [isAdmin]);

  return {
    newsItems,
    isLoading,
    error,
    fetchNewsItems,
    createNewsItem,
    updateNewsItem,
    removeNewsItem
  };
}
