
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AnnouncementsList from '@/components/announcements/AnnouncementsList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAnnouncements, Announcement } from '@/hooks/use-announcements';
import AnnouncementEditor from '@/components/announcements/AnnouncementEditor';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';

const Comunicados: React.FC = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  const { createAnnouncement, updateAnnouncement } = useAnnouncements();
  const { user } = useApp();
  
  const handleNewAnnouncement = () => {
    setSelectedAnnouncement({
      matricula: user?.selectedCondominium || '',
      title: '',
      content: ''
    });
    setIsEditorOpen(true);
  };
  
  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditorOpen(true);
  };
  
  const handleSaveAnnouncement = async (announcementData: Announcement) => {
    if (announcementData.id) {
      return updateAnnouncement(announcementData);
    } else {
      return createAnnouncement(announcementData);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Comunicados</h1>
            <p className="text-muted-foreground">
              Gerencie e envie comunicados aos moradores do seu condomínio.
            </p>
          </div>
          <Button onClick={handleNewAnnouncement} className="bg-brand-600 hover:bg-brand-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Comunicado
          </Button>
        </div>
        
        <div className="border-t pt-6">
          <AnnouncementsList onEdit={handleEditAnnouncement} />
        </div>
      </div>
      
      <AnnouncementEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        announcement={selectedAnnouncement}
        onSave={handleSaveAnnouncement}
      />
    </DashboardLayout>
  );
};

export default Comunicados;
