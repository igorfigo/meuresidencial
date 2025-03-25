
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  FileUp,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BusinessDocument {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_type: string;
  upload_date: string;
  created_at: string;
  updated_at: string;
}

const BusinessDocuments = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_admin_documents')
        .select('*')
        .order('upload_date', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Erro ao carregar documentos.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecione um arquivo para upload.');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Por favor, digite um título para o documento.');
      return;
    }
    
    try {
      setUploadingFile(true);
      
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `business_documents/${fileName}`;
      
      console.log('Uploading file to storage bucket:', 'documents');
      console.log('File path:', filePath);
      
      // Upload file to Storage
      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);
      
      if (uploadError) {
        console.error('Error uploading to storage:', uploadError);
        throw uploadError;
      }
      
      console.log('Upload successful:', data);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      console.log('Public URL:', publicUrl);
      
      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('business_admin_documents')
        .insert({
          title,
          description: description || null,
          file_path: publicUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
        });
      
      if (dbError) {
        console.error('Error inserting into database:', dbError);
        throw dbError;
      }
      
      toast.success('Documento enviado com sucesso!');
      setOpenUploadDialog(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Erro ao enviar documento. Tente novamente.');
    } finally {
      setUploadingFile(false);
    }
  };
  
  const handleDownload = (document: BusinessDocument) => {
    // Open the file URL in a new tab
    window.open(document.file_path, '_blank');
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }
    
    try {
      // Get file path first
      const { data: docData } = await supabase
        .from('business_admin_documents')
        .select('file_path')
        .eq('id', id)
        .single();
      
      if (docData) {
        // Extract storage path from URL
        const url = new URL(docData.file_path);
        const storagePath = url.pathname.split('/').slice(2).join('/');
        
        console.log('Deleting file from storage:', storagePath);
        
        // Delete from storage
        const { error: storageError, data } = await supabase.storage
          .from('documents')
          .remove([storagePath]);
          
        if (storageError) {
          console.warn('Error deleting from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        } else {
          console.log('Storage deletion result:', data);
        }
      }
      
      // Delete from database
      const { error } = await supabase
        .from('business_admin_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Documento excluído com sucesso!');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento.');
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedFile(null);
  };
  
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-700" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileText className="h-5 w-5 text-green-600" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Documentos do Negócio</h1>
          <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-brand-600 hover:bg-brand-700">
                <UploadCloud className="h-4 w-4 mr-2" />
                Enviar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enviar Novo Documento</DialogTitle>
                <DialogDescription>
                  Faça upload de um documento para a plataforma
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título*</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Contrato de Prestação de Serviços"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Adicione uma descrição para este documento..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">Arquivo*</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      id="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <FileUp className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        {selectedFile ? selectedFile.name : 'Clique para selecionar um arquivo'}
                      </p>
                      {selectedFile && (
                        <p className="text-xs text-gray-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setOpenUploadDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={uploadingFile || !selectedFile || !title.trim()}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  {uploadingFile ? 'Enviando...' : 'Enviar Documento'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gerenciar Documentos</CardTitle>
            <CardDescription>
              Armazene e gerencie documentos importantes para o seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar documentos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Carregando documentos...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum documento encontrado</h3>
                <p className="text-gray-500 mt-1">
                  {searchTerm 
                    ? 'Tente usar termos diferentes na sua busca.' 
                    : 'Comece enviando documentos para a plataforma.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data de Upload</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          {getFileIcon(doc.file_type)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {doc.title}
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {doc.file_name}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                            {doc.description || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          {new Date(doc.upload_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                              title="Baixar"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDocuments;
