
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAnnouncements, AnnouncementAttachment, Announcement } from '@/hooks/use-announcements';
import { AnnouncementForm } from '@/components/announcements/AnnouncementForm';
import { AnnouncementsList } from '@/components/announcements/AnnouncementsList';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { getAnnouncementAttachments } from '@/integrations/supabase/client';

const Comunicados = () => {
  const { 
    form, 
    announcements, 
    isLoading, 
    resetForm, 
    onSubmit, 
    deleteAnnouncement,
    isSubmitting, 
    isDeleting,
    attachments,
    existingAttachments,
    handleFileChange,
    removeFile,
    removeExistingAttachment,
    getFileUrl,
    uploadProgress,
    isUploading,
    refetch,
    updateTemplate
  } = useAnnouncements();
  
  const [showForm, setShowForm] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

  const fetchAttachments = async (announcementId: string) => {
    try {
      const data = await getAnnouncementAttachments(announcementId);
      return data as AnnouncementAttachment[];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  };

  const handleNewAnnouncement = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    resetForm(announcement);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
    setShowForm(false);
  };

  const handleDeleteClick = (id: string) => {
    setAnnouncementToDelete(id);
  };

  const confirmDelete = () => {
    if (announcementToDelete) {
      deleteAnnouncement(announcementToDelete);
      setAnnouncementToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comunicados</h1>
            <p className="text-muted-foreground">
              Gerencie os comunicados do seu condomínio
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!showForm && (
              <Button onClick={handleNewAnnouncement} className="bg-brand-600 hover:bg-brand-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Comunicado
              </Button>
            )}
          </div>
        </div>

        {showForm ? (
          <AnnouncementForm
            form={form}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            isEditing={!!form.getValues().id}
            onCancel={handleCancelForm}
            attachments={attachments}
            existingAttachments={existingAttachments}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
            removeExistingAttachment={removeExistingAttachment}
            getFileUrl={getFileUrl}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
            updateTemplate={updateTemplate}
          />
        ) : (
          <div className="rounded-md bg-white">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">
                Carregando comunicados...
              </div>
            ) : (
              <AnnouncementsList
                announcements={announcements || []}
                onEdit={handleEditAnnouncement}
                onDelete={handleDeleteClick}
                isDeleting={isDeleting}
                getFileUrl={getFileUrl}
                fetchAttachments={fetchAttachments}
                itemsPerPage={5}
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!announcementToDelete} onOpenChange={(open) => !open && setAnnouncementToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este comunicado? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Comunicados;
