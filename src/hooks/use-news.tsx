
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewsItem {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  created_at: string;
  is_active: boolean;
}

export const useNews = () => {
  const [activeNewsItem, setActiveNewsItem] = useState<NewsItem | null>(null);
  const [allNewsItems, setAllNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch active news item
      const { data: activeData, error: activeError } = await supabase
        .from('news_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (activeError && activeError.code !== 'PGRST116') {
        throw activeError;
      }

      // Fetch all news items for history
      const { data: allData, error: allError } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) {
        throw allError;
      }

      setActiveNewsItem(activeData || null);
      setAllNewsItems(allData || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNewsItem = async (newsItem: Omit<NewsItem, 'id' | 'created_at' | 'is_active'>) => {
    try {
      // Set all previous news items to inactive
      const { error: updateError } = await supabase
        .from('news_items')
        .update({ is_active: false })
        .eq('is_active', true);
        
      if (updateError) throw updateError;

      // Insert new news item
      const { error: insertError } = await supabase
        .from('news_items')
        .insert({
          title: newsItem.title,
          short_description: newsItem.short_description,
          full_content: newsItem.full_content,
          is_active: true,
        });
        
      if (insertError) throw insertError;
      
      // Refetch news after successful save
      await fetchNews();
      
      return { success: true };
    } catch (error) {
      console.error('Error saving news item:', error);
      return { success: false, error };
    }
  };

  const deleteNewsItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refetch news after successful deletion
      await fetchNews();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting news item:', error);
      return { success: false, error };
    }
  };

  return {
    activeNewsItem,
    allNewsItems,
    isLoading,
    error,
    fetchNews,
    saveNewsItem,
    deleteNewsItem
  };
};
