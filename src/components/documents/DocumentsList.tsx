
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
  FileBadge, 
  Download, 
  FileText 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Document, DocumentAttachment } from '@/hooks/use-documents';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { DocumentCard } from './DocumentCard';

interface DocumentsListProps {
  documents: Document[];
  onEdit?: (document: Document) => void;
  onDelete?: (id: string) => void;
  isDeleting: boolean;
  getFileUrl: (path: string) => Promise<string>;
  fetchAttachments: (id: string) => Promise<DocumentAttachment[]>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isResident?: boolean;
  searchTerm?: string;
}

const getDocumentTypeLabel = (tipo: string) => {
  const types: Record<string, string> = {
    'convenção': 'Convenção do Condomínio',
    'regulamento': 'Regulamento Interno',
    'ata': 'Ata de Assembléia',
    'planta': 'Planta do Edifício',
    'apolice': 'Apólice de Seguro',
    'vistoria': 'Auto de Vistoria do Corpo de Bombeiros'
  };
  
  return types[tipo] || tipo;
};

export const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  onEdit,
  onDelete,
  isDeleting,
  getFileUrl,
  fetchAttachments,
  currentPage,
  totalPages,
  onPageChange,
  isResident = false,
  searchTerm = ""
}) => {
  const [detailView, setDetailView] = useState<Document | null>(null);
  const [attachments, setAttachments] = useState<DocumentAttachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const isMobile = useIsMobile();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const handleViewDetails = async (document: Document) => {
    setDetailView(document);
    
    if (document.id) {
      setIsLoadingAttachments(true);
      try {
        const attachments = await fetchAttachments(document.id);
        setAttachments(attachments);
      } catch (error) {
        console.error("Error fetching attachments:", error);
      } finally {
        setIsLoadingAttachments(false);
      }
    }
  };

  const handleDownload = async (attachment: DocumentAttachment) => {
    try {
      const url = await getFileUrl(attachment.file_path);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = isMobile ? 3 : 5;

    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            onPageChange(1);
          }}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
    
    if (endPage - startPage < maxVisiblePages - 3) {
      startPage = Math.max(2, endPage - (maxVisiblePages - 3));
    }

    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onPageChange(i);
            }}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onPageChange(totalPages);
            }}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <>
      {documents.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-md w-full">
          <FileText className="h-10 w-10 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? "Nenhum documento encontrado para esta pesquisa" : "Nenhum documento encontrado"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isResident 
              ? "Não há documentos disponíveis para o seu condomínio."
              : searchTerm ? "Tente outro termo de pesquisa." : "Comece adicionando um novo documento."
            }
          </p>
        </div>
      ) : isMobile ? (
        <div className="space-y-2 w-full px-0">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={handleViewDetails}
              onEdit={onEdit}
              onDelete={onDelete}
              isResident={isResident}
            />
          ))}
          
          {totalPages > 1 && (
            <div className="py-3 flex justify-center w-full">
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          onPageChange(currentPage - 1);
                        }
                      }}
                    />
                  </PaginationItem>
                  
                  {generatePaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          onPageChange(currentPage + 1);
                        }
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden border-t-4 border-t-brand-600 shadow-md w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Data de Cadastro</TableHead>
                <TableHead className="text-center w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    {getDocumentTypeLabel(document.tipo)}
                  </TableCell>
                  <TableCell className="text-center">{formatDate(document.data_cadastro)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewDetails(document)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {!isResident && onEdit && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(document)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {!isResident && onDelete && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(document.id!)}
                          disabled={isDeleting}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="py-4 w-full">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          onPageChange(currentPage - 1);
                        }
                      }}
                    />
                  </PaginationItem>
                  
                  {generatePaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          onPageChange(currentPage + 1);
                        }
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>
      )}

      <Dialog open={!!detailView} onOpenChange={(open) => !open && setDetailView(null)}>
        <DialogContent className="sm:max-w-lg max-w-[95%]">
          <DialogHeader>
            <DialogTitle>Detalhes do Documento</DialogTitle>
          </DialogHeader>
          
          {detailView && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tipo</h4>
                  <p>{getDocumentTypeLabel(detailView.tipo)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Data de Cadastro</h4>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(detailView.data_cadastro)}
                  </p>
                </div>
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
                          <FileBadge className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm truncate max-w-[160px] sm:max-w-[300px]">
                            {attachment.file_name}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(attachment)}
                          className="h-8 flex-shrink-0"
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
