
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
import { Copy, Save } from 'lucide-react';
import { Announcement } from '@/hooks/use-announcements';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Opções de títulos e seus conteúdos correspondentes
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
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const isNewAnnouncement = !announcement?.id;

  // Initialize the editor when announcement data changes
  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
    }
  }, [announcement, open]);

  // Handle title selection change
  const handleTitleChange = (selectedTitle: string) => {
    setTitle(selectedTitle);
    const newContent = ANNOUNCEMENT_TEMPLATES[selectedTitle as keyof typeof ANNOUNCEMENT_TEMPLATES];
    setContent(newContent);
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // Handle save action
  const handleSave = async () => {
    if (!announcement) return;
    
    setIsSaving(true);
    
    try {
      await onSave({
        ...announcement,
        title,
        content
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle copy to clipboard
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Comunicado</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          <div>
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
              />
            )}
          </div>
          
          <div className="flex-1 overflow-hidden">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              placeholder="Conteúdo do comunicado"
              className="h-[400px] resize-none"
            />
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
              <Save className="h-4 w-4 mr-2" />
              Salvar alterações
            </Button>
          </div>
          
          <DialogClose asChild>
            <Button variant="secondary">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementEditor;
