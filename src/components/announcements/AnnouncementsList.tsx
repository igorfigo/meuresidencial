
import React, { useState } from 'react';
import { useAnnouncements, Announcement } from '@/hooks/use-announcements';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementEditor from './AnnouncementEditor';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useApp } from '@/contexts/AppContext';

const AnnouncementsList: React.FC = () => {
  const { 
    announcements, 
    isLoading, 
    error, 
    getAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    removeAnnouncement,
    createAnnouncementFromTemplate
  } = useAnnouncements();
  
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { user } = useApp();
  
  const handleViewAnnouncement = async (id: string) => {
    const announcement = await getAnnouncement(id);
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setIsEditorOpen(true);
    }
  };
  
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };
  
  const confirmDelete = async () => {
    if (deleteId) {
      await removeAnnouncement(deleteId);
      setDeleteId(null);
    }
  };
  
  const handleCreateNew = () => {
    const newAnnouncement: Announcement = {
      matricula: user?.selectedCondominium || '',
      title: '',
      content: ''
    };
    setSelectedAnnouncement(newAnnouncement);
    setIsEditorOpen(true);
  };
  
  const handleSaveAnnouncement = async (announcement: Announcement) => {
    if (announcement.id) {
      return updateAnnouncement(announcement);
    } else {
      return createAnnouncement(announcement);
    }
  };
  
  const handleUseTemplate = async (index: number) => {
    await createAnnouncementFromTemplate(index);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary m-auto"></div>
          <p className="mt-4 text-gray-500">Carregando comunicados...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-600">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Comunicados</h2>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Usar modelo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleUseTemplate(0)}>
                Convocação de Assembleia
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUseTemplate(1)}>
                Aviso de Manutenção
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUseTemplate(2)}>
                Comunicado de Segurança
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUseTemplate(3)}>
                Informações Financeiras
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUseTemplate(4)}>
                Eventos e Atividades
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUseTemplate(5)}>
                Regras e Regulamentos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUseTemplate(6)}>
                Informações Administrativas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handleCreateNew}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo comunicado
          </Button>
        </div>
      </div>
      
      {announcements.length === 0 ? (
        <div className="bg-muted/30 border border-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">Nenhum comunicado encontrado.</p>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar novo comunicado
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onView={handleViewAnnouncement}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}
      
      {selectedAnnouncement && (
        <AnnouncementEditor
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          announcement={selectedAnnouncement}
          onSave={handleSaveAnnouncement}
        />
      )}
      
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este comunicado? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AnnouncementsList;
