
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
  return (
    <Card className="w-full border shadow-sm bg-white">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="font-medium">Título</Label>
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
          <Label htmlFor="date" className="font-medium">Data</Label>
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
          <Label htmlFor="content" className="font-medium">Conteúdo</Label>
          <Textarea
            id="content"
            value={content}
            onChange={onContentChange}
            placeholder="Conteúdo do comunicado"
            className="h-[260px] resize-none w-full"
          />
          {formErrors.content && <p className="text-sm text-red-500">{formErrors.content}</p>}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap items-center justify-between gap-4 p-6 pt-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="send-email" 
              checked={sendEmail}
              onCheckedChange={onSendEmailChange}
            />
            <Label htmlFor="send-email" className="cursor-pointer">Enviar E-mail aos Moradores</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="send-whatsapp" 
              checked={sendWhatsapp}
              onCheckedChange={onSendWhatsappChange}
            />
            <Label htmlFor="send-whatsapp" className="cursor-pointer">Enviar Whatsapp aos Moradores</Label>
          </div>
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
            className="gap-2 bg-blue-500 hover:bg-blue-600"
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
