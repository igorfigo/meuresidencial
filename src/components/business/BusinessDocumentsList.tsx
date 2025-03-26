
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Download, 
  Pencil, 
  Trash, 
  File,
  FolderOpen,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { BusinessDocumentAttachment } from '@/hooks/use-business-documents';
import { Skeleton } from '@/components/ui/skeleton';

interface BusinessDocumentsListProps {
  documents: any[];
  onEdit: (document: any) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  getFileUrl: (path: string) => Promise<string>;
  fetchAttachments: (documentId: string) => Promise<BusinessDocumentAttachment[]>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BusinessDocumentsList: React.FC<BusinessDocumentsListProps> = ({
  documents,
  onEdit,
  onDelete,
  isDeleting,
  getFileUrl,
  fetchAttachments,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<{ [key: string]: BusinessDocumentAttachment[] }>({});
  const [loadingAttachments, setLoadingAttachments] = useState<{ [key: string]: boolean }>({});

  const toggleDocument = async (documentId: string) => {
    if (expandedDocument === documentId) {
      setExpandedDocument(null);
    } else {
      setExpandedDocument(documentId);
      if (!attachments[documentId]) {
        setLoadingAttachments({ ...loadingAttachments, [documentId]: true });
        try {
          const documentAttachments = await fetchAttachments(documentId);
          setAttachments({ ...attachments, [documentId]: documentAttachments });
        } catch (error) {
          console.error('Error fetching attachments:', error);
        } finally {
          setLoadingAttachments({ ...loadingAttachments, [documentId]: false });
        }
      }
    }
  };

  const handleDownload = async (attachment: BusinessDocumentAttachment) => {
    try {
      const url = await getFileUrl(attachment.file_path);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center mt-4">
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próximo
          </Button>
        </div>
      </div>
    );
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum documento encontrado</h3>
          <p className="text-muted-foreground">
            Não há documentos cadastrados. Clique em "Novo Documento" para adicionar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <React.Fragment key={document.id}>
              <TableRow className="hover:bg-slate-50 cursor-pointer">
                <TableCell
                  className="font-medium"
                  onClick={() => toggleDocument(document.id)}
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    {document.tipo}
                  </div>
                </TableCell>
                <TableCell onClick={() => toggleDocument(document.id)}>
                  {format(new Date(document.data_cadastro), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell onClick={() => toggleDocument(document.id)}>
                  <span className="line-clamp-1">
                    {document.observacoes}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDocument(document.id);
                      }}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(document);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(document.id);
                      }}
                      disabled={isDeleting}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedDocument === document.id && (
                <TableRow>
                  <TableCell colSpan={4} className="bg-slate-50 p-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Anexos:</h4>
                      {loadingAttachments[document.id] ? (
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ) : attachments[document.id]?.length ? (
                        <div className="space-y-2">
                          {attachments[document.id].map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between p-2 border rounded-md bg-white"
                            >
                              <div className="flex items-center">
                                <File className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="text-sm">{attachment.file_name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownload(attachment)}
                              >
                                <Download className="h-4 w-4 text-green-600" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhum anexo encontrado para este documento.
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      {renderPagination()}
    </div>
  );
};
