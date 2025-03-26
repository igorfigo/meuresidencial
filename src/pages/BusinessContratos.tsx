import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Trash2, Eye, Pencil, Paperclip, X, Download, FileEdit, Trash } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { useBusinessContracts, ContractAttachment } from '@/hooks/use-business-contracts';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const ContractStatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string, variant: "default" | "destructive" | "outline" | "secondary" }> = {
    active: { label: "Ativo", variant: "default" },
    pending: { label: "Pendente", variant: "secondary" },
    expired: { label: "Expirado", variant: "destructive" },
    draft: { label: "Rascunho", variant: "outline" },
  };

  const { label, variant } = statusMap[status] || { label: status, variant: "default" };

  return <Badge variant={variant}>{label}</Badge>;
};

const BusinessContratos = () => {
  const [openNewContractDialog, setOpenNewContractDialog] = useState(false);
  const [openEditContractDialog, setOpenEditContractDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [attachments, setAttachments] = useState<ContractAttachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [newContractFiles, setNewContractFiles] = useState<File[]>([]);
  const [editContractFiles, setEditContractFiles] = useState<File[]>([]);
  
  const { 
    contracts, 
    isLoading, 
    createContract, 
    updateContract,
    deleteContract,
    getContractAttachments,
    uploadAttachment,
    deleteAttachment,
    getFileUrl
  } = useBusinessContracts();

  const editForm = useForm({
    defaultValues: {
      title: '',
      counterparty: '',
      type: '',
      start_date: '',
      end_date: '',
      value: 0,
      status: 'active' as 'active' | 'pending' | 'expired' | 'draft'
    }
  });

  const filteredContracts = contracts?.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         contract.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || contract.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    if (selectedContract && openEditContractDialog) {
      editForm.reset({
        title: selectedContract.title,
        counterparty: selectedContract.counterparty,
        type: selectedContract.type,
        start_date: selectedContract.start_date,
        end_date: selectedContract.end_date,
        value: selectedContract.value,
        status: selectedContract.status
      });
    }
  }, [selectedContract, openEditContractDialog, editForm]);

  const handleSubmitNewContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const counterparty = formData.get('counterparty') as string;
    const type = formData.get('type') as string;
    const start_date = formData.get('start_date') as string;
    const end_date = formData.get('end_date') as string;
    const value = parseFloat(formData.get('value') as string);
    const status = "active";
    
    try {
      const newContract = await createContract({
        title,
        counterparty,
        type,
        start_date,
        end_date,
        value,
        status
      });
      
      if (newContractFiles.length > 0) {
        for (const file of newContractFiles) {
          await uploadAttachment(newContract.id, file);
        }
      }
      
      toast.success("Contrato criado com sucesso");
      setOpenNewContractDialog(false);
      setNewContractFiles([]);
    } catch (error) {
      console.error("Erro ao criar contrato:", error);
      toast.error("Erro ao criar contrato");
    }
  };

  const handleSubmitEditContract = async (data: any) => {
    if (!selectedContract?.id) return;
    
    try {
      await updateContract(selectedContract.id, {
        title: data.title,
        counterparty: data.counterparty,
        type: data.type,
        start_date: data.start_date,
        end_date: data.end_date,
        value: parseFloat(data.value),
        status: data.status
      });
      
      if (editContractFiles.length > 0) {
        for (const file of editContractFiles) {
          await uploadAttachment(selectedContract.id, file);
        }
      }
      
      toast.success("Contrato atualizado com sucesso");
      setOpenEditContractDialog(false);
      setEditContractFiles([]);
      
      if (openViewDialog) {
        const updatedAttachments = await getContractAttachments(selectedContract.id);
        setAttachments(updatedAttachments);
      }
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
      toast.error("Erro ao atualizar contrato");
    }
  };

  const handleAddNewContractFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    setNewContractFiles(prev => [...prev, ...newFiles]);
    
    event.target.value = '';
  };

  const handleAddEditContractFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    setEditContractFiles(prev => [...prev, ...newFiles]);
    
    event.target.value = '';
  };

  const handleRemoveNewContractFile = (index: number) => {
    setNewContractFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveEditContractFile = (index: number) => {
    setEditContractFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteContract = async (id: string) => {
    try {
      await deleteContract(id);
      toast.success("Contrato excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir contrato:", error);
      toast.error("Erro ao excluir contrato");
    }
  };

  const handleViewContract = async (contract: any) => {
    setSelectedContract(contract);
    setOpenViewDialog(true);
    
    setIsLoadingAttachments(true);
    try {
      const attachmentsData = await getContractAttachments(contract.id);
      setAttachments(attachmentsData);
    } catch (error) {
      console.error("Erro ao carregar anexos:", error);
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract);
    setOpenEditContractDialog(true);
    setEditContractFiles([]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, contractId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    try {
      await uploadAttachment(contractId, file);
      const updatedAttachments = await getContractAttachments(contractId);
      setAttachments(updatedAttachments);
    } catch (error) {
      console.error("Erro ao fazer upload do anexo:", error);
      toast.error("Erro ao fazer upload do anexo");
    } finally {
      event.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachment: ContractAttachment) => {
    try {
      await deleteAttachment(attachment);
      setAttachments(attachments.filter(a => a.id !== attachment.id));
    } catch (error) {
      console.error("Erro ao excluir anexo:", error);
      toast.error("Erro ao excluir anexo");
    }
  };

  const downloadAttachment = (attachment: ContractAttachment) => {
    const url = getFileUrl(attachment.file_path);
    window.open(url, '_blank');
  };

  const contractTypes = [
    { id: 'service', label: 'Serviço' },
    { id: 'product', label: 'Produto' },
    { id: 'partnership', label: 'Parceria' },
    { id: 'lease', label: 'Aluguel' },
    { id: 'employment', label: 'Trabalho' },
    { id: 'other', label: 'Outro' }
  ];

  const contractStatusOptions = [
    { id: 'active', label: 'Ativo' },
    { id: 'pending', label: 'Pendente' },
    { id: 'expired', label: 'Expirado' },
    { id: 'draft', label: 'Rascunho' }
  ];

  const renderListView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Contraparte</TableHead>
            <TableHead className="text-center">Início</TableHead>
            <TableHead>Término</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContracts?.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">{contract.title}</TableCell>
              <TableCell>{contract.counterparty}</TableCell>
              <TableCell className="text-center">{new Date(contract.start_date).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell>{new Date(contract.end_date).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell><ContractStatusBadge status={contract.status} /></TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewContract(contract)}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditContract(contract)}
                    title="Editar"
                  >
                    <FileEdit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600"
                        title="Excluir"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir contrato</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeleteContract(contract.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os contratos da empresa
            </p>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-2">
            <Dialog open={openNewContractDialog} onOpenChange={setOpenNewContractDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Contrato
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleSubmitNewContract}>
                  <DialogHeader>
                    <DialogTitle>Novo Contrato</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do contrato abaixo. Você pode anexar arquivos durante a criação do contrato.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Título</Label>
                      <Input id="title" name="title" required placeholder="Título do contrato" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="counterparty">Contraparte</Label>
                      <Input id="counterparty" name="counterparty" required placeholder="Empresa ou pessoa" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select name="type" required defaultValue="">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de contrato" />
                        </SelectTrigger>
                        <SelectContent>
                          {contractTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start_date">Data Início</Label>
                        <Input id="start_date" name="start_date" type="date" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end_date">Data Fim</Label>
                        <Input id="end_date" name="end_date" type="date" required />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="value">Valor (R$)</Label>
                      <Input id="value" name="value" type="number" step="0.01" required placeholder="0,00" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Anexos</Label>
                      <div className="border rounded-md p-4">
                        {newContractFiles.length > 0 ? (
                          <div className="space-y-2">
                            {newContractFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between border p-2 rounded">
                                <div className="flex items-center space-x-2 overflow-hidden">
                                  <Paperclip className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                </div>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleRemoveNewContractFile(index)}
                                  className="text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 border border-dashed rounded-md">
                            <p className="text-muted-foreground">Nenhum anexo adicionado</p>
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <Label htmlFor="newContractFileUpload" className="cursor-pointer">
                            <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm w-full justify-center">
                              <Paperclip className="h-4 w-4" />
                              <span>Adicionar Anexo</span>
                            </div>
                            <Input 
                              id="newContractFileUpload" 
                              type="file" 
                              className="hidden" 
                              onChange={handleAddNewContractFile}
                            />
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setOpenNewContractDialog(false);
                      setNewContractFiles([]);
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar contratos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {contractTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        ) : filteredContracts?.length ? (
          renderListView()
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum contrato encontrado</h3>
            <p className="text-muted-foreground mt-2 mb-4 max-w-md">
              {searchQuery || selectedType !== 'all'
                ? "Tente ajustar os filtros da sua busca ou" 
                : "Você ainda não possui contratos cadastrados. Vamos"}
              {" criar seu primeiro contrato agora?"}
            </p>
            <Button onClick={() => setOpenNewContractDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </div>
        )}
      </div>

      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Contrato</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="grid gap-6 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Título</h3>
                  <p className="text-base">{selectedContract.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Contraparte</h3>
                  <p className="text-base">{selectedContract.counterparty}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Tipo</h3>
                  <p className="text-base">{contractTypes.find(t => t.id === selectedContract.type)?.label || selectedContract.type}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Valor</h3>
                  <p className="text-base">{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedContract.value)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Data Início</h3>
                  <p className="text-base">{new Date(selectedContract.start_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Data Fim</h3>
                  <p className="text-base">{new Date(selectedContract.end_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                  <div className="mt-1">
                    <ContractStatusBadge status={selectedContract.status} />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Anexos</h3>
                  <div>
                    <Label htmlFor="fileUpload" className="cursor-pointer">
                      <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm">
                        <Paperclip className="h-4 w-4" />
                        <span>Adicionar Anexo</span>
                      </div>
                      <Input 
                        id="fileUpload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, selectedContract.id)}
                      />
                    </Label>
                  </div>
                </div>

                {isLoadingAttachments ? (
                  <div className="p-8 flex justify-center">
                    <p>Carregando anexos...</p>
                  </div>
                ) : attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="border rounded-md p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                          <Paperclip className="h-4 w-4 shrink-0" />
                          <span className="truncate">{attachment.file_name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => downloadAttachment(attachment)}
                          >
                            Baixar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600" 
                            onClick={() => handleDeleteAttachment(attachment)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed rounded-md">
                    <p className="text-muted-foreground">Nenhum anexo encontrado</p>
                    <p className="text-sm text-muted-foreground mt-1">Clique em "Adicionar Anexo" para fazer upload de um arquivo</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenViewDialog(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setOpenViewDialog(false);
              handleEditContract(selectedContract);
            }}>
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditContractDialog} onOpenChange={setOpenEditContractDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleSubmitEditContract)}>
              <DialogHeader>
                <DialogTitle>Editar Contrato</DialogTitle>
                <DialogDescription>
                  Altere os dados do contrato abaixo. Você também pode adicionar novos anexos.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="edit-title">Título</Label>
                      <FormControl>
                        <Input id="edit-title" required placeholder="Título do contrato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="counterparty"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="edit-counterparty">Contraparte</Label>
                      <FormControl>
                        <Input id="edit-counterparty" required placeholder="Empresa ou pessoa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="edit-type">Tipo</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de contrato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contractTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="edit-start-date">Data Início</Label>
                        <FormControl>
                          <Input id="edit-start-date" type="date" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="edit-end-date">Data Fim</Label>
                        <FormControl>
                          <Input id="edit-end-date" type="date" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="edit-value">Valor (R$)</Label>
                      <FormControl>
                        <Input 
                          id="edit-value" 
                          type="number" 
                          step="0.01" 
                          required 
                          placeholder="0,00" 
                          {...field}
                          value={field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contractStatusOptions.map(status => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-2">
                  <Label>Anexos adicionais</Label>
                  <div className="border rounded-md p-4">
                    {editContractFiles.length > 0 ? (
                      <div className="space-y-2">
                        {editContractFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between border p-2 rounded">
                            <div className="flex items-center space-x-2 overflow-hidden">
                              <Paperclip className="h-4 w-4 shrink-0" />
                              <span className="truncate">{file.name}</span>
                            </div>
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRemoveEditContractFile(index)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed rounded-md">
                        <p className="text-muted-foreground">Adicione novos anexos (opcional)</p>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Label htmlFor="editContractFileUpload" className="cursor-pointer">
                        <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm w-full justify-center">
                          <Paperclip className="h-4 w-4" />
                          <span>Adicionar Anexo</span>
                        </div>
                        <Input 
                          id="editContractFileUpload" 
                          type="file" 
                          className="hidden" 
                          onChange={handleAddEditContractFile}
                        />
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setOpenEditContractDialog(false);
                  setEditContractFiles([]);
                }}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BusinessContratos;
