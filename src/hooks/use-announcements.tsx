import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getAnnouncements, 
  getAnnouncementById, 
  saveAnnouncement, 
  deleteAnnouncement 
} from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface Announcement {
  id?: string;
  matricula: string;
  title: string;
  content: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
  sent_by_email?: boolean;
  sent_by_whatsapp?: boolean;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useApp();

  // Get the condominium matricula from user, handling both property manager and resident cases
  const condominiumMatricula = user?.selectedCondominium || user?.matricula || '';

  const fetchAnnouncements = async () => {
    if (!condominiumMatricula) {
      console.log("No condominium matricula available, cannot fetch announcements");
      return;
    }
    
    console.log("Fetching announcements for matricula:", condominiumMatricula);
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getAnnouncements(condominiumMatricula);
      console.log("Announcements fetched:", data);
      setAnnouncements(data as Announcement[] || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Falha ao carregar comunicados");
      toast({
        title: "Erro",
        description: "Falha ao carregar comunicados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAnnouncement = async (id: string) => {
    try {
      const data = await getAnnouncementById(id);
      return data as Announcement | null;
    } catch (err) {
      console.error("Error fetching announcement:", err);
      toast({
        title: "Erro",
        description: "Falha ao carregar comunicado",
        variant: "destructive"
      });
      return null;
    }
  };

  const sendEmailToResidents = async (announcement: Announcement) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-announcement-email', {
        body: {
          matricula: announcement.matricula,
          title: announcement.title,
          content: announcement.content
        }
      });

      if (error) {
        console.error("Error sending announcement emails:", error);
        throw new Error("Falha ao enviar emails aos moradores");
      }

      return data;
    } catch (err) {
      console.error("Error in sendEmailToResidents:", err);
      throw err;
    }
  };

  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { date, ...dataToSave } = announcementData;
      
      const result = await saveAnnouncement({
        ...dataToSave,
        matricula: condominiumMatricula,
        sent_by_email: announcementData.sent_by_email || false,
        sent_by_whatsapp: announcementData.sent_by_whatsapp || false
      });
      
      // If announcement should be sent by email
      if (announcementData.sent_by_email) {
        try {
          await sendEmailToResidents({
            ...dataToSave,
            matricula: condominiumMatricula
          });
          
          toast({
            title: "Emails enviados",
            description: "Comunicado enviado por email aos moradores",
          });
        } catch (emailError) {
          console.error("Failed to send emails:", emailError);
          toast({
            title: "Atenção",
            description: "Comunicado salvo, mas houve falha ao enviar emails",
            variant: "destructive"
          });
        }
      }
      
      toast({
        title: "Sucesso",
        description: "Comunicado criado com sucesso",
      });
      
      await fetchAnnouncements();
      return result;
    } catch (err) {
      console.error("Error creating announcement:", err);
      toast({
        title: "Erro",
        description: "Falha ao criar comunicado",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateAnnouncement = async (announcementData: Announcement) => {
    try {
      const { date, ...dataToSave } = announcementData;
      
      const result = await saveAnnouncement({
        ...dataToSave,
        sent_by_email: announcementData.sent_by_email || false,
        sent_by_whatsapp: announcementData.sent_by_whatsapp || false
      });
      
      // If announcement should be sent by email
      if (announcementData.sent_by_email) {
        try {
          await sendEmailToResidents(dataToSave);
          
          toast({
            title: "Emails enviados",
            description: "Comunicado enviado por email aos moradores",
          });
        } catch (emailError) {
          console.error("Failed to send emails:", emailError);
          toast({
            title: "Atenção",
            description: "Comunicado atualizado, mas houve falha ao enviar emails",
            variant: "destructive"
          });
        }
      }
      
      toast({
        title: "Sucesso",
        description: "Comunicado atualizado com sucesso",
      });
      
      setAnnouncements(prev => 
        prev.map(item => item.id === announcementData.id ? {...item, ...announcementData} : item)
      );
      
      return result;
    } catch (err) {
      console.error("Error updating announcement:", err);
      toast({
        title: "Erro",
        description: "Falha ao atualizar comunicado",
        variant: "destructive"
      });
      return null;
    }
  };

  const removeAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      
      toast({
        title: "Sucesso",
        description: "Comunicado excluído com sucesso",
      });
      
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      
      return true;
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast({
        title: "Erro",
        description: "Falha ao excluir comunicado",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (condominiumMatricula) {
      console.log("Condominium matricula detected, fetching announcements:", condominiumMatricula);
      fetchAnnouncements();
    } else {
      console.log("No condominium matricula available yet");
    }
  }, [condominiumMatricula]);

  return {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    getAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    removeAnnouncement
  };
}
