
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ANNOUNCEMENT_TEMPLATES } from './AnnouncementTemplates';

interface FormErrors {
  title?: string;
  content?: string;
  date?: string;
}

interface AnnouncementFormProps {
  isNewAnnouncement: boolean;
  title: string;
  content: string;
  date: string;
  sendEmail: boolean;
  sendWhatsapp: boolean;
  formErrors: FormErrors;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendEmailChange: (checked: boolean) => void;
  onSendWhatsappChange: (checked: boolean) => void;
  onSave: () => void;
  onCopy: () => void;
  onCancel: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  isNewAnnouncement,
  title,
  content,
  date,
  sendEmail,
  sendWhatsapp,
  formErrors,
  isSaving,
  onTitleChange,
  onContentChange,
  onDateChange,
  onSendEmailChange,
  onSendWhatsappChange,
  onSave,
  onCopy,
  onCancel
}) => {
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    
    // Process the text to enforce 80 characters per line
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      if (line.length <= 80) return line;
      
      // Split long lines into multiple lines of 80 characters
      const chunks = [];
      for (let i = 0; i < line.length; i += 80) {
        chunks.push(line.substring(i, i + 80));
      }
      return chunks.join('\n');
    });
    
    // Update the textarea value with the processed text
    e.target.value = processedLines.join('\n');
    
    // Call the original handler
    onContentChange(e);
  };

  return (
    <Card className="w-full border shadow-sm bg-white">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="font-medium" required>Título</Label>
          {isNewAnnouncement ? (
            <Select value={title} onValueChange={onTitleChange}>
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
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Título do comunicado"
              className="w-full"
            />
          )}
          {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date" className="font-medium" required>Data</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={onDateChange}
            className="w-full"
          />
          {formErrors.date && <p className="text-sm text-red-500">{formErrors.date}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content" className="font-medium" required>Conteúdo</Label>
          <div className="text-sm text-muted-foreground mb-1">
            Máximo de 80 caracteres por linha
          </div>
          <Textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            placeholder="Conteúdo do comunicado"
            className="h-[320px] resize-none w-full font-mono"
          />
          {formErrors.content && <p className="text-sm text-red-500">{formErrors.content}</p>}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap items-center justify-between gap-4 p-6 pt-0">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="send-email" 
              checked={sendEmail}
              onCheckedChange={onSendEmailChange}
            />
            <Label htmlFor="send-email" className="cursor-pointer">Enviar E-mail aos Moradores</Label>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2 ml-6">
            Após cadastrar o comunicado, você poderá imprimir uma versão formatada 
            para fixação em murais ou distribuição física.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onCopy}
            type="button"
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar Texto
          </Button>
          
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            className="gap-2 bg-[#2151B9] hover:bg-[#103381] text-white"
          >
            <Send className="h-4 w-4" />
            Enviar Comunicado
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementForm;
