
import React, { useState } from 'react';
import { FileText, Plus, Search, Download, Trash2, Grid, ListIcon } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { useBusinessContracts } from '@/hooks/use-business-contracts';
import { toast } from 'sonner';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  const { 
    contracts, 
    isLoading, 
    createContract, 
    downloadContract,
    deleteContract
  } = useBusinessContracts();

  const filteredContracts = contracts?.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         contract.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'todos' || contract.status === activeTab;
    
    const matchesType = selectedType === 'all' || contract.type === selectedType;
    
    return matchesSearch && matchesTab && matchesType;
  });

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
      await createContract({
        title,
        counterparty,
        type,
        start_date,
        end_date,
        value,
        status
      });
      
      toast.success("Contrato criado com sucesso");
      setOpenNewContractDialog(false);
    } catch (error) {
      console.error("Erro ao criar contrato:", error);
      toast.error("Erro ao criar contrato");
    }
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

  const handleDownloadContract = async (contractId: string) => {
    try {
      await downloadContract(contractId);
      toast.success("Download iniciado");
    } catch (error) {
      console.error("Erro ao baixar contrato:", error);
      toast.error("Erro ao baixar contrato");
    }
  };

  const contractTypes = [
    { id: 'service', label: 'Serviço' },
    { id: 'product', label: 'Produto' },
    { id: 'partnership', label: 'Parceria' },
    { id: 'lease', label: 'Aluguel' },
    { id: 'employment', label: 'Trabalho' },
    { id: 'other', label: 'Outro' }
  ];

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredContracts.map((contract) => (
        <Card key={contract.id} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="line-clamp-1 text-lg">{contract.title}</CardTitle>
                <CardDescription>{contract.counterparty}</CardDescription>
              </div>
              <ContractStatusBadge status={contract.status} />
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span className="font-medium text-foreground">
                  {contractTypes.find(t => t.id === contract.type)?.label || contract.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Valor:</span>
                <span className="font-medium text-foreground">
                  {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.value)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vigência:</span>
                <span className="font-medium text-foreground">
                  {new Date(contract.start_date).toLocaleDateString('pt-BR')} - {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex justify-between border-t">
            <Button variant="outline" size="sm" onClick={() => handleDownloadContract(contract.id)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Ações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info("Visualizar contrato (em desenvolvimento)")}>
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Editar contrato (em desenvolvimento)")}>
                  Editar
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                      Excluir
                    </DropdownMenuItem>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Contraparte</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Término</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">{contract.title}</TableCell>
              <TableCell>{contract.counterparty}</TableCell>
              <TableCell>{contractTypes.find(t => t.id === contract.type)?.label || contract.type}</TableCell>
              <TableCell>{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.value)}</TableCell>
              <TableCell>{new Date(contract.start_date).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell>{new Date(contract.end_date).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell><ContractStatusBadge status={contract.status} /></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownloadContract(contract.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info("Visualizar contrato (em desenvolvimento)")}>
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Editar contrato (em desenvolvimento)")}>
                        Editar
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                            Excluir
                          </DropdownMenuItem>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      Preencha os dados do contrato abaixo. Você poderá anexar arquivos depois de criar o contrato.
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
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenNewContractDialog(false)}>
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

          <div className="flex items-center border rounded-md overflow-hidden">
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-none h-10"
              onClick={() => setViewMode('cards')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-none h-10"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="todos" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="expired">Expirados</TabsTrigger>
            <TabsTrigger value="draft">Rascunhos</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-32 bg-gray-100 dark:bg-gray-800"></CardHeader>
                <CardContent className="pt-4 space-y-2">
                  <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                </CardContent>
                <CardFooter className="h-12 bg-gray-50 dark:bg-gray-900"></CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredContracts?.length ? (
          viewMode === 'cards' ? renderCardView() : renderListView()
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum contrato encontrado</h3>
            <p className="text-muted-foreground mt-2 mb-4 max-w-md">
              {searchQuery || selectedType || activeTab !== 'todos' 
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
    </DashboardLayout>
  );
};

export default BusinessContratos;
