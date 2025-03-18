
import React, { useState, useRef, useEffect } from 'react';
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Initialize the editor when announcement data changes
  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      
      // Initialize the iframe content after it loads
      const initializeIframe = () => {
        if (iframeRef.current?.contentDocument) {
          const doc = iframeRef.current.contentDocument;
          doc.body.innerHTML = announcement.content.replace(/\n/g, '<br>');
          doc.body.style.fontFamily = 'Arial, sans-serif';
          doc.body.style.padding = '10px';
          doc.body.style.margin = '0';
          doc.body.style.minHeight = '300px';
          doc.body.contentEditable = 'true';
          doc.designMode = 'on';
        }
      };
      
      if (iframeRef.current?.contentDocument?.readyState === 'complete') {
        initializeIframe();
      } else {
        iframeRef.current?.addEventListener('load', initializeIframe);
      }
      
      return () => {
        iframeRef.current?.removeEventListener('load', initializeIframe);
      };
    }
  }, [announcement, open]);

  // Get the current content from the iframe
  const getIframeContent = () => {
    if (iframeRef.current?.contentDocument) {
      return iframeRef.current.contentDocument.body.innerHTML.replace(/<br>/g, '\n');
    }
    return content;
  };

  // Handle save action
  const handleSave = async () => {
    if (!announcement) return;
    
    setIsSaving(true);
    
    try {
      const updatedContent = getIframeContent();
      await onSave({
        ...announcement,
        title,
        content: updatedContent
      });
      
      // Update the content state with the iframe content
      setContent(updatedContent);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    const text = getIframeContent();
    navigator.clipboard.writeText(text).then(
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
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do comunicado"
            />
          </div>
          
          <div className="flex-1 overflow-hidden">
            <Label>Conteúdo</Label>
            <div className="border rounded-md h-[calc(100%-30px)] overflow-hidden">
              <iframe
                ref={iframeRef}
                title="Editor de comunicado"
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
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
