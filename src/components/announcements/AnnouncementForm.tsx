
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Send, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
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
  sendWhatsapp: boolean; // Add the new property
  formErrors: FormErrors;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendEmailChange: (checked: boolean) => void;
  onSendWhatsappChange: (checked: boolean) => void; // Add the new handler
  onSave: () => void;
  onCopy: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  isNewAnnouncement,
  title,
  content,
  date,
  sendEmail,
  sendWhatsapp, // Add the new property
  formErrors,
  isSaving,
  onTitleChange,
  onContentChange,
  onDateChange,
  onSendEmailChange,
  onSendWhatsappChange, // Add the new handler
  onSave,
  onCopy
}) => {
  return (
    <div className="space-y-4 flex-1 overflow-hidden">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
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
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={onDateChange}
          className="w-full"
        />
        {formErrors.date && <p className="text-sm text-red-500">{formErrors.date}</p>}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Label htmlFor="content">Conteúdo</Label>
        <Textarea
          id="content"
          value={content}
          onChange={onContentChange}
          placeholder="Conteúdo do comunicado"
          className="h-[256px] resize-none w-full box-border"
        />
        {formErrors.content && <p className="text-sm text-red-500">{formErrors.content}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="send-email" 
            checked={sendEmail} 
            onCheckedChange={(checked) => onSendEmailChange(checked === true)}
          />
          <Label htmlFor="send-email">Enviar E-mail aos Moradores</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="send-whatsapp" 
            checked={sendWhatsapp} 
            onCheckedChange={(checked) => onSendWhatsappChange(checked === true)}
          />
          <Label htmlFor="send-whatsapp">Enviar Whatsapp aos Moradores</Label>
        </div>
      </div>
      
      <DialogFooter className="flex justify-between gap-2">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onCopy}
            type="button"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar Texto
          </Button>
          
          <Button 
            onClick={onSave} 
            disabled={isSaving}
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Comunicado
          </Button>
        </div>
        
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
};

export default AnnouncementForm;
