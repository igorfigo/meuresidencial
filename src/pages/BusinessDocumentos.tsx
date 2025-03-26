
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, FileText, Download, Trash2, FileArchive } from 'lucide-react';
import { toast } from 'sonner';
import { useBusinessDocuments } from '@/hooks/use-business-documents';
import { format } from 'date-fns';

const documentSchema = z.object({
  title: z.string().min(3, { message: 'Título deve ter pelo menos 3 caracteres' }),
  description: z.string().optional(),
  category: z.string().min(1, { message: 'Categoria é obrigatória' }),
  document_file: z.instanceof(File).optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

const BusinessDocumentos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    documents, 
    isLoading, 
    createDocument, 
    deleteDocument,
    uploadDocumentFile,
    downloadDocument
  } = useBusinessDocuments();
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'contracts',
    },
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onSubmit = async (data: DocumentFormValues) => {
    try {
      // Create document in database
      const documentId = await createDocument({
        title: data.title,
        description: data.description || '',
        category: data.category,
      });
      
      // Upload file if selected
      if (selectedFile && documentId) {
        await uploadDocumentFile(documentId, selectedFile);
      }
      
      // Reset form and close dialog
      form.reset();
      setSelectedFile(null);
      setIsDialogOpen(false);
      
      toast('Documento salvo', {
        description: 'O documento foi salvo com sucesso',
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast('Erro ao salvar documento', {
        description: 'Não foi possível salvar o documento',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };
  
  const handleDownloadDocument = async (id: string, fileName: string) => {
    try {
      await downloadDocument(id, fileName);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };
  
  const documentsByCategory = documents?.reduce((acc, document) => {
    const category = document.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(document);
    return acc;
  }, {} as Record<string, typeof documents>);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Documentos Administrativos</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Documento</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Contrato de Serviço" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detalhes sobre o documento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <FormControl>
                          <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            {...field}
                          >
                            <option value="contracts">Contratos</option>
                            <option value="financial">Financeiro</option>
                            <option value="legal">Documentos Legais</option>
                            <option value="operational">Operacional</option>
                            <option value="other">Outros</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Arquivo</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">Salvar Documento</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documentos Administrativos</CardTitle>
            <CardDescription>
              Gerencie todos os documentos administrativos da empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="contracts">
              <TabsList className="mb-4">
                <TabsTrigger value="contracts">Contratos</TabsTrigger>
                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
                <TabsTrigger value="operational">Operacional</TabsTrigger>
                <TabsTrigger value="other">Outros</TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <p>Carregando documentos...</p>
                </div>
              ) : (
                <>
                  <TabsContent value="contracts">
                    <DocumentsList 
                      documents={documentsByCategory?.contracts || []} 
                      onDelete={handleDeleteDocument}
                      onDownload={handleDownloadDocument}
                    />
                  </TabsContent>
                  <TabsContent value="financial">
                    <DocumentsList 
                      documents={documentsByCategory?.financial || []} 
                      onDelete={handleDeleteDocument}
                      onDownload={handleDownloadDocument}
                    />
                  </TabsContent>
                  <TabsContent value="legal">
                    <DocumentsList 
                      documents={documentsByCategory?.legal || []} 
                      onDelete={handleDeleteDocument}
                      onDownload={handleDownloadDocument}
                    />
                  </TabsContent>
                  <TabsContent value="operational">
                    <DocumentsList 
                      documents={documentsByCategory?.operational || []} 
                      onDelete={handleDeleteDocument}
                      onDownload={handleDownloadDocument}
                    />
                  </TabsContent>
                  <TabsContent value="other">
                    <DocumentsList 
                      documents={documentsByCategory?.other || []} 
                      onDelete={handleDeleteDocument}
                      onDownload={handleDownloadDocument}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

interface DocumentsListProps {
  documents: Array<{
    id: string;
    title: string;
    description: string;
    created_at: string;
    has_file: boolean;
    file_name?: string;
  }>;
  onDelete: (id: string) => void;
  onDownload: (id: string, fileName: string) => void;
}

const DocumentsList = ({ documents, onDelete, onDownload }: DocumentsListProps) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <FileArchive className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem documentos</h3>
        <p className="mt-1 text-sm text-gray-500">Adicione um novo documento para começar.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {documents.map((doc) => (
        <div key={doc.id} className="py-4 flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <FileText className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h4 className="text-sm font-medium">{doc.title}</h4>
              {doc.description && (
                <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Adicionado em {format(new Date(doc.created_at), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {doc.has_file && doc.file_name && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDownload(doc.id, doc.file_name!)}
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(doc.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BusinessDocumentos;
