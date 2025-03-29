
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  Link as LinkIcon, 
  BarChart3, 
  PlusCircle, 
  Trash2,
  ExternalLink,
  LineChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface TrafficSource {
  id: string;
  name: string;
  source: string;
  unique_code: string;
  tracking_url: string;
  created_at: string;
  visits_count: number;
}

interface VisitData {
  date: string;
  visits: number;
}

const WebsiteTraffic: React.FC = () => {
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceCode, setNewSourceCode] = useState('');
  const [isCreatingSource, setIsCreatingSource] = useState(false);
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const [selectedSource, setSelectedSource] = useState<TrafficSource | null>(null);
  const [visitData, setVisitData] = useState<VisitData[]>([]);
  const { toast } = useToast();
  
  const baseUrl = window.location.origin;
  
  useEffect(() => {
    fetchTrafficSources();
  }, []);
  
  useEffect(() => {
    if (selectedSource) {
      fetchVisitData(selectedSource.id);
    }
  }, [selectedSource]);
  
  const fetchTrafficSources = async () => {
    setIsLoadingSources(true);
    try {
      const { data, error } = await supabase
        .from('traffic_sources')
        .select('*, visits_count:traffic_visits(count)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedSources = data.map(source => ({
        ...source,
        visits_count: source.visits_count?.count || 0,
        tracking_url: `${baseUrl}/track/${source.unique_code}`
      }));
      
      setSources(formattedSources);
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as fontes de tráfego.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingSources(false);
    }
  };
  
  const fetchVisitData = async (sourceId: string) => {
    try {
      // Get visits for the last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const { data, error } = await supabase
        .from('traffic_visits')
        .select('*')
        .eq('source_id', sourceId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group visits by date
      const groupedData: Record<string, number> = {};
      
      // Initialize all dates with zero visits
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateKey = format(date, 'yyyy-MM-dd');
        groupedData[dateKey] = 0;
      }
      
      // Count visits by date
      data.forEach(visit => {
        const visitDate = new Date(visit.created_at);
        const dateKey = format(visitDate, 'yyyy-MM-dd');
        
        if (groupedData[dateKey] !== undefined) {
          groupedData[dateKey]++;
        }
      });
      
      // Convert to array for the chart
      const chartData: VisitData[] = Object.entries(groupedData).map(([date, visits]) => ({
        date: format(new Date(date), 'dd/MM'),
        visits
      }));
      
      setVisitData(chartData);
      
    } catch (error) {
      console.error('Error fetching visit data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de visitas.',
        variant: 'destructive'
      });
    }
  };
  
  const generateUniqueCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  const handleCreateSource = async () => {
    if (!newSourceName.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da fonte de tráfego é obrigatório.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsCreatingSource(true);
    
    try {
      const uniqueCode = newSourceCode || generateUniqueCode();
      
      const { data, error } = await supabase
        .from('traffic_sources')
        .insert({
          name: newSourceName.trim(),
          source: newSourceName.trim().toLowerCase().replace(/\s+/g, '-'),
          unique_code: uniqueCode
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newSource = {
        ...data,
        tracking_url: `${baseUrl}/track/${data.unique_code}`,
        visits_count: 0
      };
      
      setSources([newSource, ...sources]);
      setNewSourceName('');
      setNewSourceCode('');
      setIsCreatingSource(false);
      
      toast({
        title: 'Sucesso',
        description: 'Fonte de tráfego criada com sucesso.',
      });
      
    } catch (error) {
      console.error('Error creating traffic source:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a fonte de tráfego.',
        variant: 'destructive'
      });
      setIsCreatingSource(false);
    }
  };
  
  const handleDeleteSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('traffic_sources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSources(sources.filter(source => source.id !== id));
      
      if (selectedSource?.id === id) {
        setSelectedSource(null);
      }
      
      toast({
        title: 'Sucesso',
        description: 'Fonte de tráfego removida com sucesso.',
      });
      
    } catch (error) {
      console.error('Error deleting traffic source:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a fonte de tráfego.',
        variant: 'destructive'
      });
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Link copiado para a área de transferência.',
    });
  };
  
  const generateCustomCode = () => {
    const code = generateUniqueCode();
    setNewSourceCode(code);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Website Traffic</h1>
            <p className="text-muted-foreground">
              Gerencie e rastreie links únicos para diferentes públicos.
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Novo Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar novo link de rastreamento</DialogTitle>
                <DialogDescription>
                  Crie um link único para rastrear visitas de uma fonte específica.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Fonte</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Instagram, Facebook, Email"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="code">Código Personalizado (Opcional)</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={generateCustomCode}
                      type="button"
                    >
                      Gerar
                    </Button>
                  </div>
                  <Input
                    id="code"
                    placeholder="Código único na URL (gerado automaticamente se vazio)"
                    value={newSourceCode}
                    onChange={(e) => setNewSourceCode(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Seu link ficará: {baseUrl}/track/<span className="font-medium">{newSourceCode || 'código'}</span>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSource} disabled={isCreatingSource}>
                  {isCreatingSource ? 'Criando...' : 'Criar Link'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Links de Rastreamento</CardTitle>
              <CardDescription>
                Lista de todos os links únicos criados para rastreamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSources ? (
                <div className="flex justify-center py-8">
                  <p>Carregando fontes de tráfego...</p>
                </div>
              ) : sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum link de rastreamento criado ainda.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique em "Novo Link" para começar a rastrear visitas.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Link de Rastreamento</TableHead>
                      <TableHead className="text-right">Visitas</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.map((source) => (
                      <TableRow 
                        key={source.id}
                        className={`cursor-pointer ${selectedSource?.id === source.id ? 'bg-muted/50' : ''}`}
                        onClick={() => setSelectedSource(source)}
                      >
                        <TableCell className="font-medium">{source.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm truncate max-w-[200px]">{source.tracking_url}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(source.tracking_url);
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{source.visits_count}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSource(source.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(source.tracking_url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Estatísticas
              </CardTitle>
              <CardDescription>
                Resumo das visitas por link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedSource ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Selecione um link para ver suas estatísticas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{selectedSource.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Criado em: {formatDate(selectedSource.created_at)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center mb-2">
                          <span className="text-3xl font-bold">{selectedSource.visits_count}</span>
                          <p className="text-xs text-muted-foreground">Total de Visitas</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="h-48">
                      {visitData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart
                            data={visitData}
                            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => value}
                            />
                            <YAxis 
                              allowDecimals={false}
                              tick={{ fontSize: 10 }}
                            />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="visits"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              activeDot={{ r: 6 }}
                              name="Visitas"
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-sm text-muted-foreground">Sem dados para exibir</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WebsiteTraffic;
