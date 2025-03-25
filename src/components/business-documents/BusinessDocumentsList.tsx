
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { FileText, Download, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const BusinessDocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: '',
    observations: '',
    file: null
  });
  
  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setNewDocument({ title: '', type: '', observations: '', file: null });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDocument(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value) => {
    setNewDocument(prev => ({ ...prev, type: value }));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };
  
  const handleAddDocument = () => {
    // This would typically involve uploading the file and saving document metadata
    // For now, we'll mock it with a toast notification
    toast.success('Documento adicionado com sucesso!');
    handleCloseAddDialog();
    
    // In a real implementation, you would upload the file to storage
    // and save the document metadata to the database, then update the documents state
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Documentos Armazenados</h2>
        <Button variant="default" className="flex items-center gap-2" onClick={handleOpenAddDialog}>
          <Plus className="h-4 w-4" />
          Adicionar Documento
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
          <p className="text-slate-500 mb-4">
            Você ainda não adicionou nenhum documento. Clique no botão acima para começar.
          </p>
          <Button variant="default" onClick={handleOpenAddDialog}>
            Adicionar Documento
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Documento</TableHead>
              <TableHead>Data de Upload</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc, index) => (
              <TableRow key={index}>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{doc.file_type}</TableCell>
                <TableCell>{doc.observations}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Documento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Nome do Documento</Label>
              <Input
                id="title"
                name="title"
                value={newDocument.title}
                onChange={handleInputChange}
                placeholder="Digite o nome do documento"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Documento</Label>
              <Select value={newDocument.type} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="recibo">Recibo</SelectItem>
                  <SelectItem value="nota_fiscal">Nota Fiscal</SelectItem>
                  <SelectItem value="declaracao">Declaração</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                name="observations"
                value={newDocument.observations}
                onChange={handleInputChange}
                placeholder="Adicione observações ou detalhes sobre o documento"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAddDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddDocument} 
              disabled={!newDocument.title || !newDocument.type || !newDocument.file}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
