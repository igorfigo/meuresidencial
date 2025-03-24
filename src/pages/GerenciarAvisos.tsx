
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAnnouncementsAdmin, AdminAnnouncement } from '@/hooks/use-announcements-admin';
import AdminAnnouncementList from '@/components/announcements/AdminAnnouncementList';
import AnnouncementForm from '@/components/announcements/AdminAnnouncementForm';
import AdminOnly from '@/components/AdminOnly';

const GerenciarAvisos = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const {
    announcements,
    isLoading,
    createAnnouncement,
    updateAnnouncement,
    toggleAnnouncementStatus,
    deleteAnnouncement
  } = useAnnouncementsAdmin();

  const handleCreate = async (announcement: AdminAnnouncement) => {
    await createAnnouncement({
      title: announcement.title,
      short_description: announcement.short_description,
      full_content: announcement.full_content,
      is_active: announcement.is_active
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <AdminOnly>
      <DashboardLayout>
        <div className="space-y-6">
          <header className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gerenciar Avisos</h1>
              <p className="text-muted-foreground">
                Crie e gerencie avisos para os gestores de condomínios.
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Aviso
            </Button>
          </header>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="animate-pulse space-y-4 w-full max-w-3xl">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <AdminAnnouncementList 
              announcements={announcements}
              onDelete={deleteAnnouncement}
              onToggleStatus={toggleAnnouncementStatus}
              onUpdate={updateAnnouncement}
            />
          )}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Aviso</DialogTitle>
            </DialogHeader>
            <AnnouncementForm 
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </AdminOnly>
  );
};

export default GerenciarAvisos;
