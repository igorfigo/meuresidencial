
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Eye, 
  FileDown, 
  Check, 
  X,
  Loader2,
  DownloadCloud,
  Upload
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Define the interface for historical data requests
interface HistoricalDataRequest {
  id: string;
  matricula: string;
  condominium_name: string;
  manager_name: string;
  manager_email: string;
  request_type: 'inclusao' | 'download';
  subject: string;
  message: string;
  payment_status: 'pending' | 'completed' | 'canceled';
  status: 'new' | 'in_progress' | 'completed' | 'canceled';
  created_at: string;
  updated_at: string;
}

const AdminDadosHistoricos = () => {
  const { user } = useApp();
  const [selectedRequest, setSelectedRequest] = useState<HistoricalDataRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filter, setFilter] = useState({ status: '', payment: '', type: '', search: '' });
  
  // Redirect if not admin
  if (!user?.isAdmin) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Acesso Negado</h1>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['historical-data-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('historical_data_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching historical data requests:', error);
        toast.error('Erro ao carregar solicitações');
        return [];
      }
      
      return data as HistoricalDataRequest[];
    }
  });
  
  const filteredRequests = requests?.filter(request => {
    let passes = true;
    
    if (filter.status && request.status !== filter.status) {
      passes = false;
    }
    
    if (filter.payment && request.payment_status !== filter.payment) {
      passes = false;
    }
    
    if (filter.type && request.request_type !== filter.type) {
      passes = false;
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      if (
        !request.condominium_name?.toLowerCase().includes(searchLower) &&
        !request.manager_name?.toLowerCase().includes(searchLower) &&
        !request.matricula?.toLowerCase().includes(searchLower) &&
        !request.subject?.toLowerCase().includes(searchLower)
      ) {
        passes = false;
      }
    }
    
    return passes;
  });
  
  const handleViewRequest = (request: HistoricalDataRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };
  
  const updateRequestStatus = async (id: string, status: 'new' | 'in_progress' | 'completed' | 'canceled') => {
    try {
      const { error } = await supabase
        .from('historical_data_requests' as any)
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Status atualizado com sucesso!');
      refetch();
      setIsDetailOpen(false);
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Erro ao atualizar status');
    }
  };
  
  const updatePaymentStatus = async (id: string, payment_status: 'pending' | 'completed' | 'canceled') => {
    try {
      const { error } = await supabase
        .from('historical_data_requests' as any)
        .update({ payment_status })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Status de pagamento atualizado!');
      refetch();
      setIsDetailOpen(false);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Erro ao atualizar status de pagamento');
    }
  };
  
  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Novo</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Em Andamento</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Helper function to get payment status badge color
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pendente</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pago</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Helper function to get request type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'inclusao':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Inclusão</Badge>;
      case 'download':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Download</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-2">Solicitações de Dados Históricos</h1>
        <Separator className="mb-6" />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Gerenciar Solicitações</CardTitle>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="w-full md:w-auto">
                <Input
                  placeholder="Buscar condomínios, gestores..."
                  value={filter.search}
                  onChange={(e) => setFilter({...filter, search: e.target.value})}
                  className="w-full md:w-80"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select 
                  value={filter.status} 
                  onValueChange={(value) => setFilter({...filter, status: value})}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="new">Novos</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="canceled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={filter.payment} 
                  onValueChange={(value) => setFilter({...filter, payment: value})}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos pagamentos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="completed">Pagos</SelectItem>
                    <SelectItem value="canceled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={filter.type} 
                  onValueChange={(value) => setFilter({...filter, type: value})}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos tipos</SelectItem>
                    <SelectItem value="inclusao">Inclusão</SelectItem>
                    <SelectItem value="download">Download</SelectItem>
                  </SelectContent>
                </Select>
                
                {(filter.status || filter.payment || filter.type || filter.search) && (
                  <Button 
                    variant="outline" 
                    onClick={() => setFilter({ status: '', payment: '', type: '', search: '' })}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {filteredRequests && filteredRequests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Condomínio</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Assunto</TableHead>
                          <TableHead>Pagamento</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              {format(new Date(request.created_at), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>{request.condominium_name}</TableCell>
                            <TableCell>{getTypeBadge(request.request_type)}</TableCell>
                            <TableCell className="max-w-md truncate">{request.subject}</TableCell>
                            <TableCell>{getPaymentBadge(request.payment_status)}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewRequest(request)}
                                title="Ver detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileDown className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium mb-1">Nenhuma solicitação encontrada</h3>
                    <p>Não há solicitações de dados históricos que correspondam aos critérios de filtro.</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Details Dialog */}
        {selectedRequest && (
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Detalhes da Solicitação</DialogTitle>
                <DialogDescription>
                  Solicitação de {selectedRequest.request_type === 'inclusao' ? 'inclusão' : 'download'} de dados históricos
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Dados do Condomínio</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Condomínio:</span> {selectedRequest.condominium_name}</p>
                    <p><span className="font-medium">Matrícula:</span> {selectedRequest.matricula}</p>
                    <p><span className="font-medium">Gerente:</span> {selectedRequest.manager_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedRequest.manager_email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Dados da Solicitação</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Data:</span> {format(new Date(selectedRequest.created_at), 'dd/MM/yyyy HH:mm')}</p>
                    <p><span className="font-medium">Tipo:</span> {selectedRequest.request_type === 'inclusao' ? 'Inclusão de Históricos' : 'Download de Históricos'}</p>
                    <p><span className="font-medium">Pagamento:</span> {selectedRequest.payment_status === 'completed' ? 'Pago' : selectedRequest.payment_status === 'pending' ? 'Pendente' : 'Cancelado'}</p>
                    <p><span className="font-medium">Status:</span> {
                      selectedRequest.status === 'new' ? 'Novo' : 
                      selectedRequest.status === 'in_progress' ? 'Em Andamento' : 
                      selectedRequest.status === 'completed' ? 'Concluído' : 'Cancelado'
                    }</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 py-2">
                <h3 className="font-medium text-gray-700">Assunto</h3>
                <p className="text-gray-900">{selectedRequest.subject}</p>
              </div>
              
              <div className="space-y-2 py-2">
                <h3 className="font-medium text-gray-700">Mensagem</h3>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-wrap">
                  {selectedRequest.message}
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Atualizar Status de Pagamento</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      onClick={() => updatePaymentStatus(selectedRequest.id, 'completed')}
                      disabled={selectedRequest.payment_status === 'completed'}
                    >
                      <Check className="h-4 w-4 mr-1" /> Marcar como Pago
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      onClick={() => updatePaymentStatus(selectedRequest.id, 'pending')}
                      disabled={selectedRequest.payment_status === 'pending'}
                    >
                      Marcar como Pendente
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      onClick={() => updatePaymentStatus(selectedRequest.id, 'canceled')}
                      disabled={selectedRequest.payment_status === 'canceled'}
                    >
                      <X className="h-4 w-4 mr-1" /> Cancelar Pagamento
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Atualizar Status da Solicitação</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      onClick={() => updateRequestStatus(selectedRequest.id, 'new')}
                      disabled={selectedRequest.status === 'new'}
                    >
                      Marcar como Novo
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      onClick={() => updateRequestStatus(selectedRequest.id, 'in_progress')}
                      disabled={selectedRequest.status === 'in_progress'}
                    >
                      Marcar Em Andamento
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                      disabled={selectedRequest.status === 'completed'}
                    >
                      <Check className="h-4 w-4 mr-1" /> Marcar como Concluído
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      onClick={() => updateRequestStatus(selectedRequest.id, 'canceled')}
                      disabled={selectedRequest.status === 'canceled'}
                    >
                      <X className="h-4 w-4 mr-1" /> Cancelar Solicitação
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                {selectedRequest.request_type === 'inclusao' ? (
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {/* Implement file upload functionality */}}
                  >
                    <Upload className="h-4 w-4" /> Enviar Formulário
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {/* Implement file download functionality */}}
                  >
                    <DownloadCloud className="h-4 w-4" /> Baixar Dados
                  </Button>
                )}
                <Button 
                  variant="secondary" 
                  onClick={() => setIsDetailOpen(false)}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDadosHistoricos;
