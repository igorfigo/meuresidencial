
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  File, 
  Edit, 
  Trash2, 
  Plus, 
  FileText, 
  Search, 
  Calendar,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { BusinessDocument, useBusinessDocuments } from '@/hooks/use-business-documents';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface BusinessDocumentsListProps {
  onCreateNew: () => void;
  onEdit: (document: BusinessDocument) => void;
}

export const BusinessDocumentsList: React.FC<BusinessDocumentsListProps> = ({
  onCreateNew,
  onEdit,
}) => {
  const { documents, isLoading, deleteDocument, fetchDocumentAttachments } = useBusinessDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [documentToDelete, setDocumentToDelete] = useState<BusinessDocument | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<BusinessDocument | null>(null);
  const [documentAttachments, setDocumentAttachments] = useState<any[]>([]);

  // Handle document deletion
  const handleDelete = async () => {
    if (documentToDelete) {
      await deleteDocument.mutateAsync(documentToDelete.id);
      setDocumentToDelete(null);
    }
  };

  // Handle document details view
  const handleViewDetails = async (document: BusinessDocument) => {
    setIsLoadingDetails(true);
    setSelectedDocument(document);
    
    try {
      const attachments = await fetchDocumentAttachments(document.id);
      setDocumentAttachments(attachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setIsLoadingDetails(false);
      setIsDialogOpen(true);
    }
  };

  // Filter documents based on search term
  const filteredDocuments = documents?.filter(doc => {
    return doc.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.observacoes && doc.observacoes.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          onClick={onCreateNew}
          className="bg-brand-600 hover:bg-brand-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Documento
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !documents || documents.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">Nenhum documento encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Não foram encontrados documentos. Clique em "Novo Documento" para adicionar o primeiro.
          </p>
          <div className="mt-6">
            <Button
              onClick={onCreateNew}
              className="bg-brand-600 hover:bg-brand-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Documento
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments?.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium flex items-center">
                    <File className="h-4 w-4 mr-2 text-blue-500" />
                    {document.tipo}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {document.data_cadastro ? format(new Date(document.data_cadastro), 'dd/MM/yyyy') : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {document.observacoes || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(document)}
                        title="Ver detalhes"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(document)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDocumentToDelete(document)}
                        className="text-red-500"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      <Dialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o documento "{documentToDelete?.tipo}"? 
              Esta ação não pode ser desfeita e todos os anexos serão excluídos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDocumentToDelete(null)}
              disabled={deleteDocument.isPending}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteDocument.isPending}
            >
              {deleteDocument.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Documento</DialogTitle>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tipo:</h4>
                  <p className="text-lg font-medium">{selectedDocument.tipo}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Data:</h4>
                  <p className="text-lg font-medium">
                    {selectedDocument.data_cadastro 
                      ? format(new Date(selectedDocument.data_cadastro), 'dd/MM/yyyy') 
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Observações:</h4>
                <p className="text-gray-700 whitespace-pre-line">{selectedDocument.observacoes || '—'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Anexos:</h4>
                {documentAttachments.length === 0 ? (
                  <p className="text-gray-500 italic">Nenhum anexo encontrado</p>
                ) : (
                  <ul className="space-y-2">
                    {documentAttachments.map((attachment) => (
                      <li key={attachment.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                        <File className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm truncate flex-1">{attachment.file_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Fechar
            </Button>
            {selectedDocument && (
              <Button 
                onClick={() => {
                  setIsDialogOpen(false);
                  onEdit(selectedDocument);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
