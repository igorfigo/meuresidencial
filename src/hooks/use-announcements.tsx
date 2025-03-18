import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from './use-toast';
import { useApp } from '@/contexts/AppContext';
import { 
  getAnnouncementsByMatricula, 
  getAnnouncementAttachments,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  Announcement,
  AnnouncementAttachment
} from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';

// Form validation schema
const announcementSchema = z.object({
  id: z.string().optional(),
  data: z.string().min(1, "Data é obrigatória"),
  finalidade: z.string().min(1, "Finalidade é obrigatória"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export { Announcement, AnnouncementAttachment };

export function useAnnouncements() {
  const { toast } = useToast();
  const { user } = useApp();
  const queryClient = useQueryClient();
  const matricula = user?.selectedCondominium || '';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<string[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<AnnouncementAttachment[]>([]);
  
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      finalidade: '',
      descricao: '',
    }
  });

  // Templates for each announcement type
  const announcementTemplates: Record<string, string> = {
    'Convocação de Assembleia': `Assunto: Convocação para Assembleia Geral Ordinária

Prezados Condôminos,

Convidamos todos os moradores para a Assembleia Geral Ordinária que será realizada no dia XX de XX de 20XX, às XXh, no LOCAL. 
Pauta: aprovação do orçamento anual, eleição de síndico e assuntos gerais.

Atenciosamente, Administração do Condomínio`,

    'Aviso de Manutenção': `Assunto: Aviso de Manutenção Programada

Prezados Moradores,

Informamos que no dia XX de XX de 20XX, das Xh às Xh, será realizada a manutenção preventiva dos elevadores. Durante esse período, os elevadores estarão fora de serviço. Pedimos desculpas pelo transtorno e agradecemos a compreensão.

Atenciosamente, Administração do Condomínio`,

    'Comunicado de Segurança': `Assunto: Alerta de Segurança

Prezados Condôminos,

Devido ao aumento de furtos na região, reforçamos a importância de manter as portas e janelas fechadas e trancadas. Em caso de emergência, contate a portaria imediatamente.

Atenciosamente, Administração do Condomínio`,

    'Informações Financeiras': `Assunto: Informações sobre Taxa Condominial

Prezados Moradores,

Lembramos que a taxa condominial do mês de abril vence no dia XX. O valor é de R$ XX,00. Pedimos que efetuem o pagamento até a data de vencimento para evitar multas.

Atenciosamente, Administração do Condomínio`,

    'Eventos e Atividades': `Assunto: Festa Junina do Condomínio

Prezados Moradores,

Convidamos todos para a nossa tradicional Festa Junina, que será realizada no dia XX de XX de 20XX, às Xh, no salão de festas. Teremos comidas típicas, música e brincadeiras. Participe!

Atenciosamente, Administração do Condomínio`,

    'Regras e Regulamentos': `Assunto: Reforço das Regras de Convivência

Prezados Condôminos,

Reforçamos que é proibido o uso de áreas comuns para festas sem autorização prévia. Pedimos a colaboração de todos para manter a ordem e o respeito entre os moradores.

Atenciosamente, Administração do Condomínio`,

    'Informações Administrativas': `Assunto: XX

Prezados Moradores,

XX

Atenciosamente, Administração do Condomínio`
  };

  // Update template based on selected type
  const updateTemplate = (type: string) => {
    const template = announcementTemplates[type] || '';
    form.setValue('descricao', template);
  };
  
  // Query to fetch announcements
  const { data: announcements, isLoading, refetch } = useQuery({
    queryKey: ['announcements', matricula],
    queryFn: async () => {
      if (!matricula) return [];
      
      try {
        const data = await getAnnouncementsByMatricula(matricula);
        return data as Announcement[];
      } catch (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }
    },
    enabled: !!matricula
  });
  
  // Mutation to delete announcement
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsDeleting(true);
      
      try {
        // Fetch attachments first for deletion from storage
        const attachments = await getAnnouncementAttachments(id);
        
        // Delete files from storage
        if (attachments && attachments.length > 0) {
          for (const attachment of attachments) {
            await supabase.storage
              .from('announcement-attachments')
              .remove([attachment.file_path]);
          }
        }
        
        // Delete announcement (which will cascade delete attachments in db)
        await deleteAnnouncement(id);
        
        return id;
      } finally {
        setIsDeleting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', matricula] });
      toast({
        title: "Comunicado excluído",
        description: "O comunicado foi excluído com sucesso."
      });
    },
    onError: (error) => {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Erro ao excluir comunicado",
        description: "Ocorreu um erro ao excluir o comunicado.",
        variant: "destructive"
      });
    }
  });
  
  // File handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingAttachment = (id: string) => {
    setAttachmentsToDelete((prev) => [...prev, id]);
    setExistingAttachments((prev) => prev.filter((att) => att.id !== id));
  };
  
  // Function to get file URL
  const getFileUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from('announcement-attachments')
      .createSignedUrl(path, 60);
    
    return data?.signedUrl || '';
  };
  
  // Reset form
  const resetForm = (defaultValues?: Partial<AnnouncementFormValues>) => {
    form.reset({
      data: new Date().toISOString().split('T')[0],
      finalidade: '',
      descricao: '',
      ...defaultValues
    });
    
    setAttachments([]);
    setAttachmentsToDelete([]);
    setExistingAttachments([]);
    
    if (defaultValues?.id) {
      // Fetch existing attachments
      fetchAttachments(defaultValues.id);
    }
  };

  // Fetch attachments for edit mode
  const fetchAttachments = async (announcementId: string) => {
    try {
      const data = await getAnnouncementAttachments(announcementId);
      setExistingAttachments(data);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast({
        title: "Erro ao carregar anexos",
        description: "Ocorreu um erro ao carregar os anexos.",
        variant: "destructive"
      });
    }
  };
  
  // Submit form
  const onSubmit = async (data: AnnouncementFormValues) => {
    if (!matricula) return;
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      let announcementId = data.id;
      let isNewAnnouncement = !announcementId;
      
      // Create or update announcement
      if (isNewAnnouncement) {
        // Insert new announcement
        const newAnnouncement = await createAnnouncement({
          matricula,
          data: data.data,
          finalidade: data.finalidade,
          descricao: data.descricao
        });
        
        // Use safe access for newAnnouncement
        announcementId = newAnnouncement && newAnnouncement[0] ? newAnnouncement[0].id : undefined;
        
        // Check if we have a valid ID before proceeding
        if (!announcementId) {
          throw new Error("Failed to create announcement: No ID returned");
        }
      } else {
        // Update existing announcement
        await updateAnnouncement(announcementId, {
          data: data.data,
          finalidade: data.finalidade,
          descricao: data.descricao
        });
        
        // Delete attachments marked for deletion
        if (attachmentsToDelete.length > 0) {
          for (const attId of attachmentsToDelete) {
            // Get the attachment details
            const attData = await getAnnouncementAttachments(attId);
            
            if (attData && attData.length > 0) {
              // Delete from storage
              await supabase.storage
                .from('announcement-attachments')
                .remove([attData[0].file_path]);
              
              // Delete from database using RPC
              await supabase
                .rpc('delete_attachment', { p_attachment_id: attId });
            }
          }
        }
      }
      
      // Upload new attachments
      if (attachments.length > 0 && announcementId) {
        setIsUploading(true);
        let totalUploaded = 0;
        
        for (let i = 0; i < attachments.length; i++) {
          const file = attachments[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from('announcement-attachments')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;
          
          // Save attachment metadata using RPC
          await supabase
            .rpc('add_attachment', {
              p_announcement_id: announcementId,
              p_file_name: file.name,
              p_file_path: fileName,
              p_file_type: file.type
            });
          
          // Update progress
          totalUploaded++;
          setUploadProgress(Math.round((totalUploaded / attachments.length) * 100));
        }
        
        setIsUploading(false);
      }
      
      // Show success message and refresh data
      toast({
        title: isNewAnnouncement ? "Comunicado criado" : "Comunicado atualizado",
        description: isNewAnnouncement 
          ? "O comunicado foi criado com sucesso." 
          : "O comunicado foi atualizado com sucesso."
      });
      
      queryClient.invalidateQueries({ queryKey: ['announcements', matricula] });
      
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: "Erro ao salvar comunicado",
        description: "Ocorreu um erro ao salvar o comunicado.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  // Delete announcement
  const handleDeleteAnnouncement = (id: string) => {
    deleteAnnouncementMutation.mutate(id);
  };
  
  return {
    form,
    announcements,
    isLoading,
    isSubmitting,
    isDeleting,
    isUploading,
    uploadProgress,
    attachments,
    existingAttachments,
    resetForm,
    onSubmit,
    deleteAnnouncement: handleDeleteAnnouncement,
    handleFileChange,
    removeFile,
    removeExistingAttachment,
    getFileUrl,
    refetch,
    updateTemplate,
    announcementTemplates
  };
}
