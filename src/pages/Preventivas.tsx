
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Wrench, Plus, Calendar, Clock, Trash2, Bell, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Define the maintenance categories
const maintenanceCategories = [
  'Ar Condicionado',
  'Controle de Pragas',
  'Elevadores',
  'Fachadas',
  'Inspeção Estrutural',
  'Portões',
  'Prevenção de Incêndios',
  'Sistema Hidráulico',
  'Sistemas de Gás',
  'Sistemas de Segurança',
];

// Define the maintenance item type
interface MaintenanceItem {
  id: string;
  matricula: string;
  category: string;
  title: string;
  description: string;
  scheduled_date: string;
  created_at: string;
  completed: boolean;
  reminder_sent: boolean;
}

const Preventivas = () => {
  const { user } = useApp();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('todas');
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
  });
  
  // Load maintenance items when component mounts
  useEffect(() => {
    if (user?.matricula) {
      fetchMaintenanceItems();
    }
  }, [user]);
  
  const fetchMaintenanceItems = async () => {
    setIsLoading(true);
    try {
      // Check if table exists first - we'll create it if needed
      const { data: tablesData } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .eq('tablename', 'preventive_maintenance');
      
      if (!tablesData || tablesData.length === 0) {
        console.log('Maintenance table not found, showing empty state');
        setMaintenanceItems([]);
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .rpc('get_preventive_maintenance', { 
          p_matricula: user?.matricula || '' 
        });
        
      if (error) {
        if (error.message.includes('function "get_preventive_maintenance" does not exist')) {
          console.log('Function not found, showing empty state');
          setMaintenanceItems([]);
        } else {
          throw error;
        }
      } else {
        setMaintenanceItems(data as MaintenanceItem[] || []);
      }
    } catch (error: any) {
      console.error('Error fetching maintenance items:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens de manutenção preventiva.',
        variant: 'destructive',
      });
      setMaintenanceItems([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleAddMaintenance = async () => {
    if (!formData.category || !formData.title || !formData.scheduled_date) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Check if table exists first - we'll use RPC instead
      const { error } = await supabase
        .rpc('add_preventive_maintenance', {
          p_matricula: user?.matricula || '',
          p_category: formData.category,
          p_title: formData.title,
          p_description: formData.description,
          p_scheduled_date: formData.scheduled_date
        });
        
      if (error) {
        if (error.message.includes('function "add_preventive_maintenance" does not exist')) {
          toast({
            title: 'Funcionalidade não disponível',
            description: 'A função necessária ainda não foi implementada no banco de dados.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Sucesso!',
          description: 'Item de manutenção preventiva adicionado com sucesso.',
        });
        
        // Reset form and refresh list
        setFormData({
          category: '',
          title: '',
          description: '',
          scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        });
        setIsDialogOpen(false);
        await fetchMaintenanceItems();
      }
    } catch (error: any) {
      console.error('Error adding maintenance item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o item de manutenção preventiva.',
        variant: 'destructive',
      });
    }
  };
  
  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .rpc('toggle_preventive_maintenance_status', {
          p_id: id,
          p_completed: !completed
        });
        
      if (error) {
        if (error.message.includes('function "toggle_preventive_maintenance_status" does not exist')) {
          toast({
            title: 'Funcionalidade não disponível',
            description: 'A função necessária ainda não foi implementada no banco de dados.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }
      
      // Update local state
      setMaintenanceItems(items => 
        items.map(item => 
          item.id === id ? { ...item, completed: !completed } : item
        )
      );
      
      toast({
        title: 'Status atualizado',
        description: `Manutenção marcada como ${!completed ? 'concluída' : 'pendente'}.`,
      });
    } catch (error: any) {
      console.error('Error updating maintenance status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status da manutenção.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteMaintenance = async (id: string) => {
    try {
      const { error } = await supabase
        .rpc('delete_preventive_maintenance', {
          p_id: id
        });
        
      if (error) {
        if (error.message.includes('function "delete_preventive_maintenance" does not exist')) {
          toast({
            title: 'Funcionalidade não disponível',
            description: 'A função necessária ainda não foi implementada no banco de dados.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }
      
      // Update local state
      setMaintenanceItems(items => items.filter(item => item.id !== id));
      
      toast({
        title: 'Excluído',
        description: 'Item de manutenção preventiva excluído com sucesso.',
      });
    } catch (error: any) {
      console.error('Error deleting maintenance item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o item de manutenção preventiva.',
        variant: 'destructive',
      });
    }
  };
  
  const filteredItems = activeTab === 'todas'
    ? maintenanceItems
    : activeTab === 'pendentes'
      ? maintenanceItems.filter(item => !item.completed)
      : maintenanceItems.filter(item => item.completed);
      
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };
  
  const getStatusBadge = (item: MaintenanceItem) => {
    if (item.completed) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
          Concluído
        </span>
      );
    }
    
    const today = new Date();
    const scheduledDate = new Date(item.scheduled_date);
    
    if (scheduledDate < today) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
          Atrasado
        </span>
      );
    }
    
    // Check if it's due within the next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    if (scheduledDate <= sevenDaysFromNow) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
          Próximo
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
        Agendado
      </span>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 px-2 max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>Manutenções Preventivas</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Manutenção Preventiva</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova manutenção preventiva para agendar e acompanhar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoria*
                  </Label>
                  <div className="col-span-3">
                    <Select 
                      name="category" 
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Título*
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Ex: Manutenção mensal elevador"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="scheduled_date" className="text-right">
                    Data*
                  </Label>
                  <Input
                    id="scheduled_date"
                    name="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Detalhes sobre a manutenção preventiva"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" onClick={handleAddMaintenance}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Separator className="mb-4" />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2">Carregando...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma manutenção encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'concluidas'
                    ? 'Você ainda não tem manutenções concluídas.'
                    : activeTab === 'pendentes'
                      ? 'Você não possui manutenções pendentes.'
                      : 'Comece adicionando uma nova manutenção preventiva.'}
                </p>
                {activeTab === 'todas' && (
                  <div className="mt-6">
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className={`h-2 ${item.completed ? 'bg-green-500' : new Date(item.scheduled_date) < new Date() ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <CardHeader className="pb-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-medium">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Categoria: {item.category}
                          </CardDescription>
                        </div>
                        {getStatusBadge(item)}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {item.description && (
                        <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Data: {formatDate(item.scheduled_date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Criado em: {formatDate(item.created_at)}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2 pt-2 border-t">
                      <Button
                        variant={item.completed ? "outline" : "default"}
                        size="sm"
                        className="gap-1"
                        onClick={() => handleToggleComplete(item.id, item.completed)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {item.completed ? 'Desfazer' : 'Concluir'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleDeleteMaintenance(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Preventivas;
