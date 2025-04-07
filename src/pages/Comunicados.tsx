
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AnnouncementsList from '@/components/announcements/AnnouncementsList';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Info } from 'lucide-react';
import { useAnnouncements, Announcement } from '@/hooks/use-announcements';
import AnnouncementForm from '@/components/announcements/AnnouncementForm';
import { useApp } from '@/contexts/AppContext';
import AnnouncementConfirmDialog from '@/components/announcements/AnnouncementConfirmDialog';
import { format } from 'date-fns';
import { ANNOUNCEMENT_TEMPLATES } from '@/components/announcements/AnnouncementTemplates';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { FinancialChartCard } from '@/components/financials/FinancialChartCard';

const Comunicados: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sendEmail, setSendEmail] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [formErrors, setFormErrors] = useState<{title?: string; content?: string; date?: string}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { createAnnouncement, updateAnnouncement, announcements } = useAnnouncements();
  const { user } = useApp();
  const { markAsViewed } = useNotifications();
  const isMobile = useIsMobile();
  
  const isResident = user?.isResident === true;
  
  useEffect(() => {
    if (isResident) {
      markAsViewed('announcements');
    }
  }, [isResident, markAsViewed]);
  
  const handleNewAnnouncement = () => {
    setSelectedAnnouncement({
      matricula: user?.selectedCondominium || user?.matricula || '',
      title: '',
      content: ''
    });
    setTitle('');
    setContent('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setSendEmail(false);
    setSendWhatsapp(false);
    setFormErrors({});
    setShowForm(true);
  };
  
  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setDate(announcement.date || format(new Date(), 'yyyy-MM-dd'));
    setSendEmail(announcement.sent_by_email || false);
    setSendWhatsapp(announcement.sent_by_whatsapp || false);
    setFormErrors({});
    setShowForm(true);
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedAnnouncement(null);
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
  
  const handleSave = () => {
    if (!selectedAnnouncement) return;
    
    if (!validateForm()) {
      return;
    }
    
    if (sendEmail) {
      setShowConfirmDialog(true);
    } else {
      saveAnnouncement();
    }
  };
  
  const saveAnnouncement = async () => {
    if (!selectedAnnouncement) return;
    
    setIsSaving(true);
    
    try {
      const announcementData = {
        ...selectedAnnouncement,
        title,
        content,
        date,
        sent_by_email: sendEmail,
        sent_by_whatsapp: false
      };
      
      if (selectedAnnouncement.id) {
        await updateAnnouncement(announcementData);
      } else {
        await createAnnouncement(announcementData);
      }
      
      setShowForm(false);
      setSelectedAnnouncement(null);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };
  
  const handleTitleChange = (value: string) => {
    setTitle(value);
    const templateContent = ANNOUNCEMENT_TEMPLATES[value as keyof typeof ANNOUNCEMENT_TEMPLATES];
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

  return (
    <DashboardLayout>
      <div className="w-full p-0 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Comunicados</h1>
            <p className="text-muted-foreground">
              {isResident 
                ? "Veja todos os comunicados do seu condomínio."
                : "Gerencie e envie comunicados aos moradores do seu condomínio."
              }
            </p>
          </div>
          {!isResident && !showForm && (
            <Button 
              onClick={handleNewAnnouncement} 
              className="bg-brand-600 hover:bg-brand-700 w-full md:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Comunicado
            </Button>
          )}
        </div>

        {!showForm && (
          <div className="mb-4 px-4 sm:px-0 mx-0 w-full">
            <FinancialChartCard
              title="Pesquisar Comunicados"
              icon={<Search className="h-4 w-4" />}
              tooltip="Pesquise por título ou conteúdo"
            >
              <div className="flex items-center gap-2 w-full">
                <Input
                  placeholder="Pesquisar comunicados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              {!isMobile && (
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Encontre comunicados por título ou conteúdo</span>
                </div>
              )}
            </FinancialChartCard>
          </div>
        )}
        
        <div className="w-full px-4 sm:px-0 mx-0">
          {!isResident && showForm ? (
            <Card className="border-t-4 border-t-brand-600 shadow-md bg-white w-full mx-0">
              <AnnouncementForm
                isNewAnnouncement={!selectedAnnouncement?.id}
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
                onCancel={handleCancelForm}
              />
            </Card>
          ) : (
            <div className="w-full mx-0">
              <AnnouncementsList 
                onEdit={!isResident ? handleEditAnnouncement : undefined}
                isResident={isResident}
                searchTerm={searchTerm}
              />
            </div>
          )}
        </div>
      </div>
      
      {!isResident && (
        <AnnouncementConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          onConfirm={saveAnnouncement}
        />
      )}
    </DashboardLayout>
  );
};

export default Comunicados;
