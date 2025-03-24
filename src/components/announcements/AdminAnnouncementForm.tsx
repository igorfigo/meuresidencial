
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AdminAnnouncement } from '@/hooks/use-announcements-admin';

interface AnnouncementFormProps {
  announcement?: AdminAnnouncement;
  onSubmit: (announcement: AdminAnnouncement) => Promise<any>;
  onCancel: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  announcement,
  onSubmit,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{
    title?: string;
    shortDescription?: string;
    fullContent?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setShortDescription(announcement.short_description);
      setFullContent(announcement.full_content);
      setIsActive(announcement.is_active);
    }
  }, [announcement]);

  const validate = () => {
    const newErrors: {
      title?: string;
      shortDescription?: string;
      fullContent?: string;
    } = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "O título é obrigatório";
      isValid = false;
    }

    if (!shortDescription.trim()) {
      newErrors.shortDescription = "A descrição curta é obrigatória";
      isValid = false;
    } else if (shortDescription.length > 150) {
      newErrors.shortDescription = "A descrição curta deve ter no máximo 150 caracteres";
      isValid = false;
    }

    if (!fullContent.trim()) {
      newErrors.fullContent = "O conteúdo é obrigatório";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    const announcementData: AdminAnnouncement = {
      ...(announcement || {}),
      title,
      short_description: shortDescription,
      full_content: fullContent,
      is_active: isActive
    };
    
    try {
      await onSubmit(announcementData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input 
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do aviso"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="shortDescription">
          Descrição Curta <span className="text-xs text-muted-foreground">(máx. 150 caracteres)</span>
        </Label>
        <Input
          id="shortDescription"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Breve descrição"
          className={errors.shortDescription ? "border-red-500" : ""}
        />
        {errors.shortDescription && <p className="text-sm text-red-500">{errors.shortDescription}</p>}
        <p className="text-xs text-muted-foreground text-right">{shortDescription.length}/150</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullContent">Conteúdo Completo</Label>
        <Textarea
          id="fullContent"
          value={fullContent}
          onChange={(e) => setFullContent(e.target.value)}
          placeholder="Conteúdo detalhado do aviso"
          rows={6}
          className={errors.fullContent ? "border-red-500" : ""}
        />
        {errors.fullContent && <p className="text-sm text-red-500">{errors.fullContent}</p>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="isActive">Ativo</Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
