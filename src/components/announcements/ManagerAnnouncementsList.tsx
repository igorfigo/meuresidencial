
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ManagerAnnouncement } from '@/hooks/use-manager-announcements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';

interface ManagerAnnouncementsListProps {
  announcements: ManagerAnnouncement[];
  isLoading: boolean;
}

const ManagerAnnouncementsList: React.FC<ManagerAnnouncementsListProps> = ({ announcements, isLoading }) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ManagerAnnouncement | null>(null);

  const handleViewClick = (announcement: ManagerAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Avisos</CardTitle>
          <CardDescription>Carregando avisos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="space-y-2 w-full">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Avisos</CardTitle>
          <CardDescription>Nenhum aviso disponível no momento.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Não há avisos para exibir.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Avisos</CardTitle>
          <CardDescription>Últimos avisos e comunicados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{announcement.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(announcement.created_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleViewClick(announcement)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm mt-1">{announcement.short_description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              {selectedAnnouncement?.created_at && format(new Date(selectedAnnouncement?.created_at), 'dd/MM/yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Descrição</h4>
              <p className="text-sm">{selectedAnnouncement?.short_description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Conteúdo</h4>
              <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                {selectedAnnouncement?.full_content}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManagerAnnouncementsList;
