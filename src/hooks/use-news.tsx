
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewsItem {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  created_at: string;
  is_active: boolean;
}

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching news items...');
      
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching news:', error);
        throw error;
      }
      
      console.log('News items fetched:', data);
      setNews(data || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new news item
  const addNewsItem = async (newsItem: Omit<NewsItem, 'id' | 'created_at'>) => {
    try {
      setError(null);
      
      console.log('Adding news item:', newsItem);
      
      const { data, error } = await supabase
        .from('news_items')
        .insert([{
          ...newsItem,
          is_active: true
        }])
        .select();
      
      if (error) {
        console.error('Error adding news item:', error);
        throw error;
      }
      
      console.log('News item added successfully:', data);
      
      // Return the created news item
      return data?.[0];
    } catch (err: any) {
      console.error('Error adding news item:', err);
      setError(err?.message || 'Failed to add news item');
      throw err;
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { news, isLoading, error, fetchNews, addNewsItem };
};
