
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
  Bug, 
  Rat, 
  FileBadge, 
  Download, 
  TerminalSquare 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PestControl, PestControlAttachment } from '@/hooks/use-pest-control';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PestControlsListProps {
  pestControls: PestControl[];
  onEdit: (pestControl: PestControl) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  getFileUrl: (path: string) => Promise<string>;
  fetchAttachments: (id: string) => Promise<PestControlAttachment[]>;
  itemsPerPage?: number;
}

export const PestControlsList: React.FC<PestControlsListProps> = ({
  pestControls,
  onEdit,
  onDelete,
  isDeleting,
  getFileUrl,
  fetchAttachments,
  itemsPerPage = 6
}) => {
  const [detailView, setDetailView] = useState<PestControl | null>(null);
  const [attachments, setAttachments] = useState<PestControlAttachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(pestControls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = pestControls.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const handleViewDetails = async (pestControl: PestControl) => {
    setDetailView(pestControl);
    
    if (pestControl.id) {
      setIsLoadingAttachments(true);
      try {
        const attachments = await fetchAttachments(pestControl.id);
        setAttachments(attachments);
      } catch (error) {
        console.error("Error fetching attachments:", error);
      } finally {
        setIsLoadingAttachments(false);
      }
    }
  };

  const handleDownload = async (attachment: PestControlAttachment) => {
    try {
      const url = await getFileUrl(attachment.file_path);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const renderFinalidades = (finalidades: string[]) => {
    return (
      <div className="flex items-center space-x-1">
        {finalidades.includes('insetos') && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
            <Bug className="h-3 w-3 mr-1" /> Insetos
          </span>
        )}
        {finalidades.includes('ratos') && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
            <Rat className="h-3 w-3 mr-1" /> Ratos
          </span>
        )}
        {finalidades.includes('cupim') && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
            <TerminalSquare className="h-3 w-3 mr-1" /> Cupim
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      {pestControls.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-md">
          <Bug className="h-10 w-10 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma dedetização cadastrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece adicionando uma nova dedetização.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden border-t-4 border-t-brand-600 shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="text-center">Data</TableHead>
                  <TableHead>Finalidade</TableHead>
                  <TableHead className="text-center w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((pestControl) => (
                  <TableRow key={pestControl.id}>
                    <TableCell className="font-medium">{pestControl.empresa}</TableCell>
                    <TableCell className="text-center">{formatDate(pestControl.data)}</TableCell>
                    <TableCell>{renderFinalidades(pestControl.finalidade)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewDetails(pestControl)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(pestControl)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(pestControl.id!)}
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
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
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
            <DialogTitle>Detalhes da Dedetização</DialogTitle>
          </DialogHeader>
          
          {detailView && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Empresa</h4>
                  <p>{detailView.empresa}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Data</h4>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(detailView.data)}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Finalidade</h4>
                {renderFinalidades(detailView.finalidade)}
              </div>
              
              {detailView.observacoes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Observações</h4>
                  <p className="text-sm whitespace-pre-line">{detailView.observacoes}</p>
                </div>
              )}
              
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
