
import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

interface Document {
  id: string;
  title: string;
  created_at: string;
  file_type: string;
  observations?: string;
  file_path?: string;
  file_name?: string;
}

export const BusinessDocumentsList = () => {
  const { user } = useApp();
  const matricula = user?.selectedCondominium || '';

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: '',
    observations: '',
    file: null as File | null
  });
  
  // Fetch documents on component mount
  useEffect(() => {
    if (matricula) {
      fetchDocuments();
    }
  }, [matricula]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('business_documents')
        .select('*')
        .eq('matricula', matricula)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Não foi possível carregar os documentos');
    }
  };
  
  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setNewDocument({ title: '', type: '', observations: '', file: null });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDocument(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setNewDocument(prev => ({ ...prev, type: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };
  
  const handleAddDocument = async () => {
    if (!matricula) {
      toast.error('Matrícula não encontrada');
      return;
    }
    
    if (!newDocument.title || !newDocument.type || !newDocument.file) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Upload the file to Supabase Storage
      const fileExt = newDocument.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${matricula}/${fileName}`;
      
      // Check if business_files bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.find(b => b.name === 'business_files');
      
      if (!bucketExists) {
        // This would typically be done via SQL migration, but for simplicity we'll create it here
        await supabase.storage.createBucket('business_files', {
          public: false
        });
      }
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('business_files')
        .upload(filePath, newDocument.file);
      
      if (uploadError) throw uploadError;
      
      // 2. Save document metadata to the database
      const { data, error } = await supabase
        .from('business_documents')
        .insert([
          {
            matricula,
            title: newDocument.title,
            file_type: newDocument.type,
            observations: newDocument.observations,
            file_path: filePath,
            file_name: newDocument.file.name
          }
        ])
        .select();
      
      if (error) throw error;
      
      // 3. Update the local state with the new document
      if (data && data.length > 0) {
        setDocuments(prev => [data[0], ...prev]);
      }
      
      toast.success('Documento adicionado com sucesso!');
      handleCloseAddDialog();
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Erro ao adicionar documento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('business_files')
        .download(document.file_path!);
      
      if (error) throw error;
      
      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name || 'documento';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Erro ao baixar documento');
    }
  };

  const handleDeleteDocument = async (id: string, filePath: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;
    
    try {
      // Delete document from database
      const { error: dbError } = await supabase
        .from('business_documents')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('business_files')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      toast.success('Documento excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento');
    }
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
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{doc.file_type}</TableCell>
                <TableCell>{doc.observations}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Download"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Excluir"
                      onClick={() => handleDeleteDocument(doc.id, doc.file_path!)}
                    >
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
            <Button variant="outline" onClick={handleCloseAddDialog} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddDocument} 
              disabled={isLoading || !newDocument.title || !newDocument.type || !newDocument.file}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
