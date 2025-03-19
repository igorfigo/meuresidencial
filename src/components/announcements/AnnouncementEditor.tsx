
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { Announcement } from '@/hooks/use-announcements';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import AnnouncementForm from './AnnouncementForm';
import AnnouncementConfirmDialog from './AnnouncementConfirmDialog';
import { ANNOUNCEMENT_TEMPLATES } from './AnnouncementTemplates';

interface AnnouncementEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onSave: (announcement: Announcement) => Promise<any>;
}

const AnnouncementEditor: React.FC<AnnouncementEditorProps> = ({
  open,
  onOpenChange,
  announcement,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSaving, setIsSaving] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<{title?: string; content?: string; date?: string}>({});
  const { toast } = useToast();
  const isNewAnnouncement = !announcement?.id;

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      
      if (announcement.date) {
        setDate(announcement.date);
      } else {
        setDate(format(new Date(), 'yyyy-MM-dd'));
      }
    }
  }, [announcement, open]);

  const handleTitleChange = (selectedTitle: string) => {
    setTitle(selectedTitle);
    // Set content based on the selected template
    const templateContent = ANNOUNCEMENT_TEMPLATES[selectedTitle as keyof typeof ANNOUNCEMENT_TEMPLATES];
    if (templateContent) {
      setContent(templateContent);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const validateForm = () => {
    const errors: {title?: string; content?: string; date?: string} = {};
    let isValid = true;

    if (!title.trim()) {
      errors.title = "O título é obrigatório";
      isValid = false;
    }

    if (!content.trim()) {
      errors.content = "O conteúdo é obrigatório";
      isValid = false;
    }

    if (!date) {
      errors.date = "A data é obrigatória";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSave = async () => {
    if (!announcement) return;
    
    if (!validateForm()) {
      toast({
        title: "Campos incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    if (sendEmail || sendWhatsapp) {
      setShowConfirmDialog(true);
    } else {
      await saveAnnouncement();
    }
  };

  const saveAnnouncement = async () => {
    if (!announcement) return;
    
    setIsSaving(true);
    
    try {
      await onSave({
        ...announcement,
        title,
        content,
        date
      });
      
      onOpenChange(false);
      
      let description = "Comunicado salvo com sucesso";
      if (sendEmail && sendWhatsapp) {
        description = "Comunicado enviado com sucesso por e-mail e WhatsApp";
      } else if (sendEmail) {
        description = "Comunicado enviado com sucesso por e-mail";
      } else if (sendWhatsapp) {
        description = "Comunicado enviado com sucesso por WhatsApp";
      }
      
      toast({
        title: "Sucesso",
        description: description,
      });
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(
      () => {
        toast({
          title: "Copiado!",
          description: "Texto copiado para a área de transferência"
        });
      },
      (err) => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Erro",
          description: "Não foi possível copiar o texto",
          variant: "destructive"
        });
      }
    );
  };
  
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>{isNewAnnouncement ? "Criar Comunicado" : "Editar Comunicado"}</DialogTitle>
          </DialogHeader>
          
          <AnnouncementForm
            isNewAnnouncement={isNewAnnouncement}
            title={title}
            content={content}
            date={date}
            sendEmail={sendEmail}
            sendWhatsapp={sendWhatsapp}
            formErrors={formErrors}
            isSaving={isSaving}
            onTitleChange={handleTitleChange}
            onContentChange={handleContentChange}
            onDateChange={handleDateChange}
            onSendEmailChange={setSendEmail}
            onSendWhatsappChange={setSendWhatsapp}
            onSave={handleSave}
            onCopy={handleCopy}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      <AnnouncementConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={saveAnnouncement}
      />
    </>
  );
};

export default AnnouncementEditor;
