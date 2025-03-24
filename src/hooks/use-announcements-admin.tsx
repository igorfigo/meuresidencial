
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AdminAnnouncement {
  id?: string;
  title: string;
  short_description: string;
  full_content: string;
  is_active: boolean;
  created_at?: string;
}

export function useAnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAnnouncements(data || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
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

  const getAnnouncement = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as AdminAnnouncement;
    } catch (err) {
      console.error("Error fetching announcement:", err);
      toast({
        title: "Erro",
        description: "Falha ao carregar aviso",
        variant: "destructive"
      });
      return null;
    }
  };

  const createAnnouncement = async (announcementData: Omit<AdminAnnouncement, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .insert([announcementData])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Aviso criado com sucesso",
      });
      
      await fetchAnnouncements();
      return data[0];
    } catch (err) {
      console.error("Error creating announcement:", err);
      toast({
        title: "Erro",
        description: "Falha ao criar aviso",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateAnnouncement = async (announcementData: AdminAnnouncement) => {
    try {
      const { id, ...dataToUpdate } = announcementData;
      
      const { data, error } = await supabase
        .from('news_items')
        .update(dataToUpdate)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Aviso atualizado com sucesso",
      });
      
      setAnnouncements(prev => 
        prev.map(item => item.id === id ? {...item, ...dataToUpdate} : item)
      );
      
      return data[0];
    } catch (err) {
      console.error("Error updating announcement:", err);
      toast({
        title: "Erro",
        description: "Falha ao atualizar aviso",
        variant: "destructive"
      });
      return null;
    }
  };

  const toggleAnnouncementStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .update({ is_active: !currentStatus })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Aviso ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });
      
      setAnnouncements(prev => 
        prev.map(item => item.id === id ? {...item, is_active: !currentStatus} : item)
      );
      
      return data[0];
    } catch (err) {
      console.error("Error toggling announcement status:", err);
      toast({
        title: "Erro",
        description: "Falha ao alterar status do aviso",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Aviso excluído com sucesso",
      });
      
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      
      return true;
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast({
        title: "Erro",
        description: "Falha ao excluir aviso",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    getAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    toggleAnnouncementStatus,
    deleteAnnouncement
  };
}
