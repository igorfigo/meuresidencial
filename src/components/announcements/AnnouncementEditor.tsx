import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Send } from 'lucide-react';
import { Announcement } from '@/hooks/use-announcements';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ANNOUNCEMENT_TEMPLATES = {
  "Convocação de Assembleia": `Assunto: Convocação para Assembleia Geral Ordinária

Prezados Condôminos,

Convidamos todos os moradores para a Assembleia Geral Ordinária que será realizada no dia 25 de março de 2025, às 19h, no salão de festas. Pauta: aprovação do orçamento anual, eleição de síndico e assuntos gerais.

Atenciosamente, Administração do Condomínio`,
  "Aviso de Manutenção": `Assunto: Aviso de Manutenção Programada

Prezados Moradores,

Informamos que no dia 30 de março de 2025, das 8h às 12h, será realizada a manutenção preventiva dos elevadores. Durante esse período, os elevadores estarão fora de serviço. Pedimos desculpas pelo transtorno e agradecemos a compreensão.

Atenciosamente, Administração do Condomínio`,
  "Comunicado de Segurança": `Assunto: Alerta de Segurança

Prezados Condôminos,

Devido ao aumento de furtos na região, reforçamos a importância de manter as portas e janelas fechadas e trancadas. Em caso de emergência, contate a portaria imediatamente.

Atenciosamente, Administração do Condomínio`,
  "Informações Financeiras": `Assunto: Informações sobre Taxa Condominial

Prezados Moradores,

Lembramos que a taxa condominial do mês de abril vence no dia 10. O valor é de R$ 500,00. Pedimos que efetuem o pagamento até a data de vencimento para evitar multas.

Atenciosamente, Administração do Condomínio`,
  "Eventos e Atividades": `Assunto: Festa Junina do Condomínio

Prezados Moradores,

Convidamos todos para a nossa tradicional Festa Junina, que será realizada no dia 15 de junho de 2025, às 18h, no salão de festas. Teremos comidas típicas, música e brincadeiras. Participe!

Atenciosamente, Administração do Condomínio`,
  "Regras e Regulamentos": `Assunto: Reforço das Regras de Convivência

Prezados Condôminos,

Reforçamos que é proibido o uso de áreas comuns para festas sem autorização prévia. Pedimos a colaboração de todos para manter a ordem e o respeito entre os moradores.

Atenciosamente, Administração do Condomínio`,
  "Informações Administrativas": `Assunto: Mudança na Administração

Prezados Moradores,

Informamos que a empresa XYZ será a nova responsável pela administração do condomínio a partir de 1º de abril de 2025. Contamos com a colaboração de todos durante essa transição.

Atenciosamente, Administração do Condomínio`
};

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
    const newContent = ANNOUNCEMENT_TEMPLATES[selectedTitle as keyof typeof ANNOUNCEMENT_TEMPLATES];
    setContent(newContent);
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
    
    if (sendEmail) {
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
      
      toast({
        title: "Sucesso",
        description: sendEmail 
          ? "Comunicado enviado com sucesso para os moradores" 
          : "Comunicado salvo com sucesso",
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{isNewAnnouncement ? "Criar Comunicado" : "Editar Comunicado"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-hidden">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              {isNewAnnouncement ? (
                <Select value={title} onValueChange={handleTitleChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um título" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ANNOUNCEMENT_TEMPLATES).map((templateTitle) => (
                      <SelectItem key={templateTitle} value={templateTitle}>
                        {templateTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título do comunicado"
                  className="w-full"
                />
              )}
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={handleDateChange}
                className="w-full"
              />
              {formErrors.date && <p className="text-sm text-red-500">{formErrors.date}</p>}
            </div>
            
            <div className="flex-1 overflow-hidden">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={content}
                onChange={handleContentChange}
                placeholder="Conteúdo do comunicado"
                className="h-[320px] resize-none w-full"
              />
              {formErrors.content && <p className="text-sm text-red-500">{formErrors.content}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="send-email" 
                checked={sendEmail} 
                onCheckedChange={(checked) => setSendEmail(checked === true)}
              />
              <Label htmlFor="send-email">Enviar E-mail aos Moradores</Label>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCopy}
                type="button"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar texto
              </Button>
              
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Comunicado
              </Button>
            </div>
            
            <DialogClose asChild>
              <Button variant="secondary">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar envio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza do envio? A ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={saveAnnouncement}>
              Confirmar envio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AnnouncementEditor;
