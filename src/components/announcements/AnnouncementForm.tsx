
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  onCopy
}) => {
  return (
    <div className="space-y-6 flex-1 overflow-hidden">
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
          className="h-[240px] resize-none w-full"
        />
        {formErrors.content && <p className="text-sm text-red-500">{formErrors.content}</p>}
      </div>

      <RadioGroup 
        defaultValue={sendEmail ? "email" : sendWhatsapp ? "whatsapp" : ""} 
        className="space-y-2"
        onValueChange={(value) => {
          if (value === "email") {
            onSendEmailChange(true);
            onSendWhatsappChange(false);
          } else if (value === "whatsapp") {
            onSendEmailChange(false);
            onSendWhatsappChange(true);
          } else {
            onSendEmailChange(false);
            onSendWhatsappChange(false);
          }
        }}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="email" id="send-email" />
          <Label htmlFor="send-email" className="cursor-pointer">Enviar E-mail aos Moradores</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="whatsapp" id="send-whatsapp" />
          <Label htmlFor="send-whatsapp" className="cursor-pointer">Enviar Whatsapp aos Moradores</Label>
        </div>
      </RadioGroup>
      
      <DialogFooter className="flex justify-end gap-2 pt-4">
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
        
        <DialogClose asChild>
          <Button variant="outline" className="gap-2">
            Cancelar
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
};

export default AnnouncementForm;
