
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getAnnouncements, 
  getAnnouncementById, 
  saveAnnouncement, 
  deleteAnnouncement 
} from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

export interface Announcement {
  id?: string;
  matricula: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

// Sample template announcements
export const ANNOUNCEMENT_TEMPLATES = [
  {
    title: "Convocação de Assembleia",
    content: "Assunto: Convocação para Assembleia Geral Ordinária\n\nPrezados Condôminos,\n\nConvidamos todos os moradores para a Assembleia Geral Ordinária que será realizada no dia 25 de março de 2025, às 19h, no salão de festas. Pauta: aprovação do orçamento anual, eleição de síndico e assuntos gerais.\n\nAtenciosamente, Administração do Condomínio"
  },
  {
    title: "Aviso de Manutenção",
    content: "Assunto: Aviso de Manutenção Programada\n\nPrezados Moradores,\n\nInformamos que no dia 30 de março de 2025, das 8h às 12h, será realizada a manutenção preventiva dos elevadores. Durante esse período, os elevadores estarão fora de serviço. Pedimos desculpas pelo transtorno e agradecemos a compreensão.\n\nAtenciosamente, Administração do Condomínio"
  },
  {
    title: "Comunicado de Segurança",
    content: "Assunto: Alerta de Segurança\n\nPrezados Condôminos,\n\nDevido ao aumento de furtos na região, reforçamos a importância de manter as portas e janelas fechadas e trancadas. Em caso de emergência, contate a portaria imediatamente.\n\nAtenciosamente, Administração do Condomínio"
  },
  {
    title: "Informações Financeiras",
    content: "Assunto: Informações sobre Taxa Condominial\n\nPrezados Moradores,\n\nLembramos que a taxa condominial do mês de abril vence no dia 10. O valor é de R$ 500,00. Pedimos que efetuem o pagamento até a data de vencimento para evitar multas.\n\nAtenciosamente, Administração do Condomínio"
  },
  {
    title: "Eventos e Atividades",
    content: "Assunto: Festa Junina do Condomínio\n\nPrezados Moradores,\n\nConvidamos todos para a nossa tradicional Festa Junina, que será realizada no dia 15 de junho de 2025, às 18h, no salão de festas. Teremos comidas típicas, música e brincadeiras. Participe!\n\nAtenciosamente, Administração do Condomínio"
  },
  {
    title: "Regras e Regulamentos",
    content: "Assunto: Reforço das Regras de Convivência\n\nPrezados Condôminos,\n\nReforçamos que é proibido o uso de áreas comuns para festas sem autorização prévia. Pedimos a colaboração de todos para manter a ordem e o respeito entre os moradores.\n\nAtenciosamente, Administração do Condomínio"
  },
  {
    title: "Informações Administrativas",
    content: "Assunto: Mudança na Administração\n\nPrezados Moradores,\n\nInformamos que a empresa XYZ será a nova responsável pela administração do condomínio a partir de 1º de abril de 2025. Contamos com a colaboração de todos durante essa transição.\n\nAtenciosamente, Administração do Condomínio"
  }
];

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useApp();

  const selectedCondominium = user?.selectedCondominium || '';

  const fetchAnnouncements = async () => {
    if (!selectedCondominium) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getAnnouncements(selectedCondominium);
      // Type assertion to ensure proper typing
      setAnnouncements(data as Announcement[] || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements");
      toast({
        title: "Error",
        description: "Failed to load announcements",
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
        title: "Error",
        description: "Failed to load announcement",
        variant: "destructive"
      });
      return null;
    }
  };

  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await saveAnnouncement({
        ...announcementData,
        matricula: selectedCondominium
      });
      
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      
      await fetchAnnouncements();
      return result;
    } catch (err) {
      console.error("Error creating announcement:", err);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateAnnouncement = async (announcementData: Announcement) => {
    try {
      const result = await saveAnnouncement(announcementData);
      
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      
      // Update the local state to reflect changes
      setAnnouncements(prev => 
        prev.map(item => item.id === announcementData.id ? {...item, ...announcementData} : item)
      );
      
      return result;
    } catch (err) {
      console.error("Error updating announcement:", err);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive"
      });
      return null;
    }
  };

  const removeAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      
      // Update the local state to remove the deleted item
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      
      return true;
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive"
      });
      return false;
    }
  };

  const createAnnouncementFromTemplate = async (templateIndex: number) => {
    if (templateIndex < 0 || templateIndex >= ANNOUNCEMENT_TEMPLATES.length) {
      return null;
    }
    
    const template = ANNOUNCEMENT_TEMPLATES[templateIndex];
    return createAnnouncement({
      matricula: selectedCondominium,
      title: template.title,
      content: template.content
    });
  };

  // Initial load of announcements
  useEffect(() => {
    if (selectedCondominium) {
      fetchAnnouncements();
    }
  }, [selectedCondominium]);

  return {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    getAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    removeAnnouncement,
    createAnnouncementFromTemplate
  };
}
