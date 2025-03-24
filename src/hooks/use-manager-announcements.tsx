
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ManagerAnnouncement {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  created_at: string;
}

export function useManagerAnnouncements() {
  const [announcements, setAnnouncements] = useState<ManagerAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAnnouncements(data || []);
    } catch (err) {
      console.error("Error fetching active announcements:", err);
      setError("Falha ao carregar avisos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAnnouncements();
  }, []);

  return {
    announcements,
    isLoading,
    error,
    fetchActiveAnnouncements
  };
}
