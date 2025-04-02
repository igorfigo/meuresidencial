
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Files, Trash2, Upload, X, File, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBusinessDocuments, BusinessDocument, BusinessDocumentAttachment } from '@/hooks/use-business-documents';
import { toast } from 'sonner';

const BusinessDocuments = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState<{ title: string; date: string }>({ title: '', date: '' });
  const [selectedDocument, setSelectedDocument] = useState<BusinessDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<BusinessDocumentAttachment[]>([]);
  const { 
    documents, 
    isLoading, 
    isUploading,
    createDocument, 
    deleteDocument,
    getDocumentAttachments,
    uploadAttachment,
    deleteAttachment
  } = useBusinessDocuments();

  const openAddDialog = () => {
    setNewDocument({ title: '', date: new Date().toISOString().split('T')[0] });
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    setSelectedFile(null);
  };

  const handleCreateDocument = async () => {
    if (!newDocument.title || !newDocument.date) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const result = await createDocument.mutateAsync(newDocument);
      closeAddDialog();
      
      // If a file was selected, upload it after creating the document
      if (selectedFile && result.id) {
        await uploadAttachment(result.id, selectedFile);
      }
    } catch (error) {
      console.error('Error in document creation:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      await deleteDocument.mutateAsync(id);
    }
  };

  const handleViewAttachments = async (document: BusinessDocument) => {
    setSelectedDocument(document);
    const docAttachments = await getDocumentAttachments(document.id);
    setAttachments(docAttachments);
  };

  const closeAttachmentsDialog = () => {
    setSelectedDocument(null);
    setAttachments([]);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadAttachment = async () => {
    if (selectedDocument && selectedFile) {
      await uploadAttachment(selectedDocument.id, selectedFile);
      // Refresh attachments list
      const docAttachments = await getDocumentAttachments(selectedDocument.id);
      setAttachments(docAttachments);
      setSelectedFile(null);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, filePath: string) => {
    if (window.confirm('Tem certeza que deseja excluir este anexo?')) {
      await deleteAttachment(attachmentId, filePath);
      // Refresh attachments list
      if (selectedDocument) {
        const docAttachments = await getDocumentAttachments(selectedDocument.id);
        setAttachments(docAttachments);
      }
    }
  };

  const downloadAttachment = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from('documents').download(filePath);
      
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Erro ao baixar o arquivo.');
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="w-full">
            <h1 className="text-3xl font-bold tracking-tight">Documentos Empresariais</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os documentos relacionados à empresa
            </p>
            <Separator className="mt-4 w-full" />
          </div>
          <div className="flex mt-4 md:mt-0 space-x-2">
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-100 dark:bg-gray-800"></div>
                <div className="pt-4 p-6 space-y-2">
                  <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                </div>
                <div className="h-12 bg-gray-50 dark:bg-gray-900"></div>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-t-4 border-t-brand-500 rounded-md bg-white dark:bg-gray-900 p-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Files className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum documento empresarial encontrado</h3>
            <p className="text-muted-foreground mt-2 mb-4 max-w-md">
              Você ainda não possui documentos cadastrados. Vamos registrar seu primeiro documento agora?
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Button>
          </div>
        ) : (
          <Card className="border-t-4 border-t-brand-500">
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Lista de documentos empresariais</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        {format(new Date(doc.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(doc.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAttachments(doc)}
                        >
                          <Files className="h-4 w-4 mr-1" />
                          Anexos
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Document Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Documento</DialogTitle>
            <DialogDescription>
              Preencha os dados do documento empresarial.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newDocument.title}
                onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                placeholder="Título do documento"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={newDocument.date}
                onChange={(e) => setNewDocument({ ...newDocument, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Anexo (opcional)</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <div className="flex items-center mt-2 p-2 bg-muted rounded">
                  <File className="h-4 w-4 mr-2" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAddDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateDocument}
              disabled={createDocument.isPending}
            >
              {createDocument.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Manage Attachments Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && closeAttachmentsDialog()}>
        {selectedDocument && (
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Anexos - {selectedDocument.title}</DialogTitle>
              <DialogDescription>
                Gerenciar anexos para este documento.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <Button
                    onClick={handleUploadAttachment}
                    disabled={!selectedFile || isUploading}
                    variant="outline"
                  >
                    {isUploading ? (
                      <>Enviando...</>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
                {selectedFile && (
                  <div className="flex items-center p-2 bg-muted rounded">
                    <File className="h-4 w-4 mr-2" />
                    <span className="text-sm">{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Separator />
                {attachments.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    Nenhum anexo encontrado para este documento.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {attachments.map((attachment) => (
                      <li
                        key={attachment.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-muted transition-colors"
                      >
                        <div 
                          className="flex items-center flex-1 cursor-pointer overflow-hidden"
                          onClick={() => downloadAttachment(attachment.file_path, attachment.file_name)}
                        >
                          <File className="h-5 w-5 mr-3 flex-shrink-0" />
                          <span className="text-sm truncate">{attachment.file_name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteAttachment(attachment.id, attachment.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={closeAttachmentsDialog}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </DashboardLayout>
  );
};

export default BusinessDocuments;
