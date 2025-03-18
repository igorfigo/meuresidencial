
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from './use-toast';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

export interface AnnouncementAttachment {
  id: string;
  announcement_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

export interface Announcement {
  id?: string;
  matricula: string;
  data: string;
  finalidade: string;
  descricao: string;
  created_at?: string;
  updated_at?: string;
}

// Form validation schema
const announcementSchema = z.object({
  id: z.string().optional(),
  data: z.string().min(1, "Data é obrigatória"),
  finalidade: z.string().min(1, "Finalidade é obrigatória"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

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
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('matricula', matricula)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!matricula
  });
  
  // Mutation to delete announcement
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsDeleting(true);
      
      try {
        // First, fetch all attachments
        const { data: attachments } = await supabase
          .from('announcement_attachments')
          .select('*')
          .eq('announcement_id', id);
        
        // Delete files from storage
        if (attachments && attachments.length > 0) {
          for (const attachment of attachments) {
            await supabase.storage
              .from('announcement-attachments')
              .remove([attachment.file_path.split('/').pop() || '']);
          }
        }
        
        // Delete announcement (cascade will delete attachments)
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
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
      .createSignedUrl(path.split('/').pop() || '', 60);
    
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
    const { data } = await supabase
      .from('announcement_attachments')
      .select('*')
      .eq('announcement_id', announcementId);
    
    if (data) {
      setExistingAttachments(data);
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
        const { data: newAnnouncement, error: insertError } = await supabase
          .from('announcements')
          .insert({
            matricula,
            data: data.data,
            finalidade: data.finalidade,
            descricao: data.descricao
          })
          .select();
        
        if (insertError) throw insertError;
        
        announcementId = newAnnouncement?.[0]?.id;
      } else {
        // Update existing announcement
        const { error: updateError } = await supabase
          .from('announcements')
          .update({
            data: data.data,
            finalidade: data.finalidade,
            descricao: data.descricao,
            updated_at: new Date().toISOString()
          })
          .eq('id', announcementId);
        
        if (updateError) throw updateError;
        
        // Delete attachments marked for deletion
        if (attachmentsToDelete.length > 0) {
          for (const attId of attachmentsToDelete) {
            const { data: attToDelete } = await supabase
              .from('announcement_attachments')
              .select('file_path')
              .eq('id', attId)
              .single();
            
            if (attToDelete) {
              // Delete from storage
              await supabase.storage
                .from('announcement-attachments')
                .remove([attToDelete.file_path.split('/').pop() || '']);
              
              // Delete from database
              await supabase
                .from('announcement_attachments')
                .delete()
                .eq('id', attId);
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
          
          // Save attachment metadata
          const { error: attachError } = await supabase
            .from('announcement_attachments')
            .insert({
              announcement_id: announcementId,
              file_name: file.name,
              file_path: fileName,
              file_type: file.type
            });
          
          if (attachError) throw attachError;
          
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
  const deleteAnnouncement = (id: string) => {
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
    deleteAnnouncement,
    handleFileChange,
    removeFile,
    removeExistingAttachment,
    getFileUrl,
    refetch,
    updateTemplate,
    announcementTemplates
  };
}
