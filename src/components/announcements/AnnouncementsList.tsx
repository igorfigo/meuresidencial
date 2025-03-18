import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  MessageSquare, 
  FileBadge, 
  Download, 
  Megaphone 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Announcement, AnnouncementAttachment } from '@/hooks/use-announcements';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface AnnouncementsListProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  getFileUrl: (path: string) => Promise<string>;
  fetchAttachments: (id: string) => Promise<AnnouncementAttachment[]>;
  itemsPerPage?: number;
}

export const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
  announcements,
  onEdit,
  onDelete,
  isDeleting,
  getFileUrl,
  fetchAttachments,
  itemsPerPage = 5
}) => {
  const [detailView, setDetailView] = useState<Announcement | null>(null);
  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(announcements.length / itemsPerPage);
  const currentItems = announcements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // If the date is already in format yyyy-MM-dd, we'll format it
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
      }
      // Otherwise, try to parse the date
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleViewDetails = async (announcement: Announcement) => {
    setDetailView(announcement);
    
    if (announcement.id) {
      setIsLoadingAttachments(true);
      try {
        const attachments = await fetchAttachments(announcement.id);
        setAttachments(attachments);
      } catch (error) {
        console.error("Error fetching attachments:", error);
      } finally {
        setIsLoadingAttachments(false);
      }
    }
  };

  const handleDownload = async (attachment: AnnouncementAttachment) => {
    try {
      const url = await getFileUrl(attachment.file_path);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      {announcements.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-md">
          <Megaphone className="h-10 w-10 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum comunicado cadastrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece adicionando um novo comunicado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Finalidade</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>{formatDate(announcement.data)}</TableCell>
                    <TableCell className="font-medium">{announcement.finalidade}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewDetails(announcement)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(announcement)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(announcement.id!)}
                          disabled={isDeleting}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => goToPage(currentPage - 1)} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      isActive={currentPage === page} 
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => goToPage(currentPage + 1)} 
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Details dialog */}
      <Dialog open={!!detailView} onOpenChange={(open) => !open && setDetailView(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Comunicado</DialogTitle>
          </DialogHeader>
          
          {detailView && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Data</h4>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(detailView.data)}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Finalidade</h4>
                  <p>{detailView.finalidade}</p>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Conteúdo
                </h4>
                <div className="mt-2 text-sm whitespace-pre-line bg-slate-50 p-3 rounded-md">
                  {detailView.descricao}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Anexos</h4>
                {isLoadingAttachments ? (
                  <p className="text-sm text-muted-foreground">Carregando anexos...</p>
                ) : attachments.length > 0 ? (
                  <ul className="space-y-2 mt-2">
                    {attachments.map((attachment) => (
                      <li 
                        key={attachment.id} 
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <FileBadge className="h-4 w-4 text-blue-500" />
                          <span className="text-sm truncate max-w-[300px]">
                            {attachment.file_name}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(attachment)}
                          className="h-8"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Baixar
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum anexo disponível</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
