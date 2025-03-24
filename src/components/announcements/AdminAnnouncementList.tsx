
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Pencil, Trash, Power, PowerOff } from 'lucide-react';
import { AdminAnnouncement } from '@/hooks/use-announcements-admin';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import AnnouncementForm from './AdminAnnouncementForm';

interface AdminAnnouncementListProps {
  announcements: AdminAnnouncement[];
  onDelete: (id: string) => Promise<boolean>;
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<any>;
  onUpdate: (announcement: AdminAnnouncement) => Promise<any>;
}

const AdminAnnouncementList: React.FC<AdminAnnouncementListProps> = ({
  announcements,
  onDelete,
  onToggleStatus,
  onUpdate
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AdminAnnouncement | null>(null);

  const handleViewClick = (announcement: AdminAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setViewDialogOpen(true);
  };

  const handleEditClick = (announcement: AdminAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (announcement: AdminAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatusClick = async (announcement: AdminAnnouncement) => {
    if (!announcement.id) return;
    await onToggleStatus(announcement.id, announcement.is_active);
  };

  const confirmDelete = async () => {
    if (selectedAnnouncement?.id) {
      await onDelete(selectedAnnouncement.id);
    }
    setDeleteDialogOpen(false);
  };

  const handleUpdate = async (updatedAnnouncement: AdminAnnouncement) => {
    await onUpdate(updatedAnnouncement);
    setEditDialogOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className={`shadow-sm ${!announcement.is_active ? 'opacity-70' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {announcement.created_at && format(new Date(announcement.created_at), 'dd/MM/yyyy HH:mm')}
                    {!announcement.is_active && <span className="ml-2 text-red-500">(Inativo)</span>}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleViewClick(announcement)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(announcement)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleToggleStatusClick(announcement)}>
                    {announcement.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(announcement)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{announcement.short_description}</p>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum aviso encontrado.</p>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aviso "{selectedAnnouncement?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Descrição Curta</h4>
              <p className="text-sm">{selectedAnnouncement?.short_description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Conteúdo Completo</h4>
              <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                {selectedAnnouncement?.full_content}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Aviso</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <AnnouncementForm 
              announcement={selectedAnnouncement} 
              onSubmit={handleUpdate} 
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminAnnouncementList;
