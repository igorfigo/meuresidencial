
import React, { useState } from 'react';
import { useAnnouncements, Announcement } from '@/hooks/use-announcements';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Mail, Printer } from 'lucide-react';
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { jsPDF } from 'jspdf';

interface AnnouncementsListProps {
  onEdit?: (announcement: Announcement) => void;
  isResident?: boolean;
}

const ITEMS_PER_PAGE = 6;

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({ onEdit, isResident = false }) => {
  const { 
    announcements, 
    isLoading, 
    error, 
    getAnnouncement,
    removeAnnouncement
  } = useAnnouncements();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailView, setDetailView] = useState<Announcement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  const handleViewAnnouncement = async (id: string) => {
    const announcement = await getAnnouncement(id);
    if (announcement) {
      setDetailView(announcement);
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

  const handlePrintAnnouncement = async (id: string) => {
    const announcement = await getAnnouncement(id);
    if (announcement) {
      const doc = new jsPDF({
        compress: false,
        putOnlyUsedFonts: true,
        hotfixes: ["px_scaling"]
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      doc.setFillColor(155, 135, 245);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("COMUNICADO OFICIAL", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.text("CONDOMÍNIO", 105, 30, { align: "center" });
      
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      
      doc.setDrawColor(155, 135, 245);
      doc.setLineWidth(0.5);
      doc.line(margin, 50, pageWidth - margin, 50);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(announcement.title.toUpperCase(), 105, 70, { align: "center" });
      
      doc.setLineWidth(0.5);
      doc.line(85, 75, 125, 75);
      
      // Create content box with purple border
      const contentYStart = 85;
      const contentLines = doc.splitTextToSize(announcement.content, contentWidth - 10); // Subtract 10 to account for padding
      const contentHeight = contentLines.length * 5 + 15; // Each line is approximately 5 units tall, plus padding
      
      // Draw a rectangle with purple border around the content
      doc.setDrawColor(155, 135, 245); // Purple border color
      doc.setLineWidth(1);
      doc.setFillColor(255, 255, 255); // White background
      doc.roundedRect(margin - 5, contentYStart - 5, contentWidth + 10, contentHeight, 3, 3, 'FD'); // FD = Fill and Draw
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      // Add the content text inside the box with some padding
      doc.text(contentLines, margin, contentYStart + 5);
      
      doc.setDrawColor(155, 135, 245);
      doc.setLineWidth(0.5);
      doc.line(margin, 250, pageWidth - margin, 250);
      
      doc.setFontSize(12);
      doc.text("Administração do Condomínio", 105, 260, { align: "center" });
      
      doc.setLineWidth(0.2);
      doc.line(65, 270, 145, 270);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(`Documento gerado em ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`, 105, 280, { align: "center" });
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("www.meuresidencial.com", 105, 287, { align: "center" });
      
      const safeTitle = announcement.title
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
      doc.save(`comunicado_${safeTitle}.pdf`);
    }
  };

  const totalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE);
  const paginatedAnnouncements = announcements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
    <Card className="overflow-hidden border-t-4 border-t-brand-600 shadow-md">
      {announcements.length === 0 ? (
        <div className="bg-muted/30 border border-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">Nenhum comunicado encontrado.</p>
        </div>
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="text-center">Data</TableHead>
                <TableHead className="text-center">Enviado por</TableHead>
                <TableHead className="text-center w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAnnouncements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">{announcement.title}</TableCell>
                  <TableCell className="text-center">{announcement.created_at ? formatDate(announcement.created_at) : '-'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Mail 
                              className={`h-4 w-4 ${announcement.sent_by_email ? 'text-green-500' : 'text-gray-300'}`} 
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {announcement.sent_by_email ? "Enviado por e-mail" : "Não enviado por e-mail"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => announcement.id && handleViewAnnouncement(announcement.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {!isResident && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => announcement.id && handlePrintAnnouncement(announcement.id)}
                          >
                            <Printer className="h-4 w-4 text-blue-500" />
                          </Button>
                          
                          {onEdit && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => announcement.id && handleDeleteClick(announcement.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="py-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        isActive={currentPage === index + 1}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
      
      <Dialog open={!!detailView} onOpenChange={(open) => !open && setDetailView(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailView?.title}</DialogTitle>
          </DialogHeader>
          
          {detailView && (
            <div className="space-y-4 mt-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Data</h4>
                <p>{detailView.created_at ? formatDate(detailView.created_at) : '-'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Conteúdo</h4>
                <p className="text-sm whitespace-pre-line">{detailView.content}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Enviado via</h4>
                <div className="flex mt-1">
                  <div className="flex items-center">
                    <Mail className={`h-4 w-4 mr-2 ${detailView.sent_by_email ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>{detailView.sent_by_email ? 'E-mail' : 'Não enviado por e-mail'}</span>
                  </div>
                </div>
              </div>
              
              {!isResident && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => detailView.id && handlePrintAnnouncement(detailView.id)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
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
    </Card>
  );
};

export default AnnouncementsList;
