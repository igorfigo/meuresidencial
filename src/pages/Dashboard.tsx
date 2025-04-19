import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Users, FileText, MapPin, Wallet, Home, Bug, BellRing, FileCheck, Receipt, PiggyBank, ArrowDownCircle, ArrowUpCircle, Clock, UserX, UserCheck, FileText as FileTextIcon, BarChart3, PieChart, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatToBRL, BRLToNumber } from '@/utils/currency';
import { useFinances } from '@/hooks/use-finances';
import { BalanceDisplay } from '@/components/financials/BalanceDisplay';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { usePlans } from '@/hooks/use-plans';
import PlanDistributionChart from '@/components/dashboard/PlanDistributionChart';
import ReactMarkdown from 'react-markdown';
import { useManagerStats } from '@/hooks/use-manager-stats';
import { useIsMobile } from '@/hooks/use-mobile';

interface LocationStats {
  states: [string, number][];
  cities: Record<string, [string, number][]>;
  neighborhoods: [string, number][];
}

interface DashboardStats {
  activeManagers: number;
  invoicePreference: number;
  locationStats: LocationStats;
}

interface NewsItem {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  is_active: boolean;
  created_at: string;
}

interface RecentItem {
  id: string;
  title: string;
  date: string;
  type: 'announcement' | 'document' | 'pest-control';
}

const Dashboard = () => {
  const { user } = useApp();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isStateDetailOpen, setIsStateDetailOpen] = useState(false);
  const [latestNews, setLatestNews] = useState<NewsItem | null>(null);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [residentCount, setResidentCount] = useState(0);
  const [commonAreasCount, setCommonAreasCount] = useState(0);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const { balance, recentTransactions, isLoading: isFinancesLoading } = useFinances();
  const [unitStatusData, setUnitStatusData] = useState<any[]>([]);
  const { plans } = usePlans();
  const isMobile = useIsMobile();
  
  const [stats, setStats] = useState<DashboardStats>({
    activeManagers: 0,
    invoicePreference: 0,
    locationStats: {
      states: [],
      cities: {},
      neighborhoods: []
    }
  });
  
  const [statsDetails, setStatsDetails] = useState({
    activeManagers: 0,
    inactiveManagers: 0,
    invoicePreference: 0,
    bankSlipPreference: 0,
    regionData: []
  });

  const [planDistribution, setPlanDistribution] = useState<{name: string, count: number, color: string}[]>([]);
  const [isLoadingPlanData, setIsLoadingPlanData] = useState(false);
  
  useEffect(() => {
    if (user?.isAdmin) {
      fetchDetailedStats();
      fetchPlanDistribution();
    }
    if (!user?.isAdmin) {
      fetchLatestNews();
      fetchResidentCount();
      fetchCommonAreasCount();
      fetchRecentItems();
      
      if (!user?.isResident) {
        fetchUnitPaymentStatus();
      }
    }
  }, [user?.isAdmin, user?.isResident, user?.selectedCondominium]);
  
  const fetchPlanDistribution = async () => {
    try {
      setIsLoadingPlanData(true);
      
      const { data, error } = await supabase
        .from('condominiums')
        .select('planocontratado')
        .eq('ativo', true)
        .not('planocontratado', 'is', null);
        
      if (error) throw error;
      
      const planCounts: Record<string, number> = {};
      
      data.forEach(item => {
        const plan = item.planocontratado || 'unknown';
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      });
      
      const colors = {
        'basic': '#3498db',
        'standard': '#2ecc71',
        'premium': '#f1c40f',
        'enterprise': '#9b59b6',
        'unknown': '#95a5a6'
      };
      
      const formattedData = Object.entries(planCounts).map(([name, count]) => ({
        name,
        count,
        color: colors[name as keyof typeof colors] || '#95a5a6'
      })).sort((a, b) => b.count - a.count);
      
      setPlanDistribution(formattedData);
    } catch (err) {
      console.error('Error fetching plan distribution:', err);
    } finally {
      setIsLoadingPlanData(false);
    }
  };

  const fetchLatestNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching latest news:', error);
        return;
      }
      
      if (data) {
        setLatestNews(data);
      }
    } catch (error) {
      console.error('Error in fetchLatestNews:', error);
    }
  };

  const fetchResidentCount = async () => {
    if (!user?.selectedCondominium) return;
    
    try {
      const { count, error } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('matricula', user.selectedCondominium);
        
      if (error) {
        console.error('Error fetching resident count:', error);
        return;
      }
      
      setResidentCount(count || 0);
    } catch (error) {
      console.error('Error in fetchResidentCount:', error);
    }
  };
  
  const fetchCommonAreasCount = async () => {
    if (!user?.selectedCondominium) return;
    
    try {
      const { count, error } = await supabase
        .from('common_areas')
        .select('*', { count: 'exact', head: true })
        .eq('matricula', user.selectedCondominium);
        
      if (error) {
        console.error('Error fetching common areas count:', error);
        return;
      }
      
      setCommonAreasCount(count || 0);
    } catch (error) {
      console.error('Error in fetchCommonAreasCount:', error);
    }
  };

  const fetchRecentItems = async () => {
    if (!user?.selectedCondominium) return;
    
    try {
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('id, title, created_at')
        .eq('matricula', user.selectedCondominium)
        .order('created_at', { ascending: false })
        .limit(8);
        
      if (announcementsError) {
        console.error('Error fetching announcements:', announcementsError);
      }
      
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('id, tipo, created_at')
        .eq('matricula', user.selectedCondominium)
        .order('created_at', { ascending: false })
        .limit(8);
        
      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
      }
      
      const { data: pestControls, error: pestControlsError } = await supabase
        .from('pest_controls')
        .select('id, data, created_at')
        .eq('matricula', user.selectedCondominium)
        .order('created_at', { ascending: false })
        .limit(8);
        
      if (pestControlsError) {
        console.error('Error fetching pest controls:', pestControlsError);
      }
      
      const combinedItems: RecentItem[] = [
        ...(announcements || []).map(item => ({
          id: item.id,
          title: item.title,
          date: item.created_at,
          type: 'announcement' as const
        })),
        ...(documents || []).map(item => ({
          id: item.id,
          title: item.tipo,
          date: item.created_at,
          type: 'document' as const
        })),
        ...(pestControls || []).map(item => ({
          id: item.id,
          title: `Dedetização`,
          date: item.created_at,
          type: 'pest-control' as const
        }))
      ];
      
      const sortedItems = combinedItems.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 8);
      
      setRecentItems(sortedItems);
    } catch (error) {
      console.error('Error in fetchRecentItems:', error);
    }
  };

  const fetchUnitPaymentStatus = async () => {
    if (!user?.selectedCondominium) return;
    
    try {
      const today = new Date();
      const currentMonth = format(today, 'yyyy-MM', { locale: ptBR });
      
      const { data: residents, error: residentsError } = await supabase
        .from('residents')
        .select('id, unidade')
        .eq('matricula', user?.selectedCondominium);
      
      if (residentsError) throw residentsError;
      
      const { data: paidUnits, error: paidUnitsError } = await supabase
        .from('financial_incomes')
        .select('unit')
        .eq('matricula', user?.selectedCondominium)
        .eq('category', 'taxa_condominio')
        .eq('reference_month', currentMonth);
      
      if (paidUnitsError) throw paidUnitsError;
      
      const totalUnits = residents.length;
      
      const paidUnitNames = new Set(paidUnits.map(item => item.unit).filter(Boolean));
      const paidUnitsCount = paidUnitNames.size;
      
      const unpaidUnits = totalUnits - paidUnitsCount;
      
      const paidUnitsList = residents
        .filter(resident => paidUnitNames.has(resident.unidade))
        .map(resident => resident.unidade)
        .sort();
        
      const unpaidUnitsList = residents
        .filter(resident => !paidUnitNames.has(resident.unidade))
        .map(resident => resident.unidade)
        .sort();
      
      setUnitStatusData([
        { name: 'Pagas', value: paidUnitsCount, units: paidUnitsList },
        { name: 'Pendentes', value: unpaidUnits, units: unpaidUnitsList }
      ]);
    } catch (error) {
      console.error('Error fetching unit payment status:', error);
      setUnitStatusData([]);
    }
  };

  const fetchDetailedStats = async () => {
    try {
      const { count: activeCount, error: activeError } = await supabase
        .from('condominiums')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);
      
      if (activeError) throw activeError;
      
      const { count: inactiveCount, error: inactiveError } = await supabase
        .from('condominiums')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', false);
      
      if (inactiveError) throw inactiveError;
      
      const { count: invoiceCount, error: invoiceError } = await supabase
        .from('condominiums')
        .select('*', { count: 'exact', head: true })
        .eq('tipodocumento', 'notaFiscal');
      
      if (invoiceError) throw invoiceError;
      
      const { count: receiptCount, error: receiptError } = await supabase
        .from('condominiums')
        .select('*', { count: 'exact', head: true })
        .eq('tipodocumento', 'recibo');
      
      if (receiptError) throw receiptError;
      
      const { data: regionData, error: regionError } = await supabase
        .from('condominiums')
        .select('estado')
        .not('estado', 'is', null);
      
      if (regionError) throw regionError;
      
      const regionCounts: Record<string, number> = {};
      regionData.forEach(item => {
        if (item.estado) {
          regionCounts[item.estado] = (regionCounts[item.estado] || 0) + 1;
        }
      });
      
      const topRegions = Object.entries(regionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      console.log("Payment preferences - Invoice:", invoiceCount, "Receipt:", receiptCount);
      
      setStatsDetails({
        activeManagers: activeCount || 0,
        inactiveManagers: inactiveCount || 0,
        invoicePreference: invoiceCount || 0,
        bankSlipPreference: receiptCount || 0,
        regionData: topRegions
      });
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
    }
  };

  const isRecentNews = (createdAt: string): boolean => {
    try {
      const postDate = parseISO(createdAt);
      const today = new Date();
      return differenceInDays(today, postDate) <= 7;
    } catch (error) {
      console.error('Error calculating if news is recent:', error);
      return false;
    }
  };

  const handleStateClick = (state: string) => {
    setSelectedState(state);
    setIsStateDetailOpen(true);
  };

  const getGreeting = () => {
    if (user?.isAdmin) {
      return (
        <>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {user.nome}</h1>
          <p className="text-muted-foreground">Aqui está seu Dashboard Gerencial.</p>
        </>
      );
    } else if (user?.isResident) {
      return (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            Olá {user?.nome || 'Morador(a)'}
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo(a) ao {user?.nomeCondominio || 'Condomínio'} - Unidade {user?.unit || ''}
          </p>
        </>
      );
    } else {
      return (
        <>
          <h1 className={`text-2xl font-bold tracking-tight ${isMobile ? "text-xl" : ""}`}>
            Olá {user?.nome || 'Representante'}
          </h1>
          <p className={`text-muted-foreground text-sm ${isMobile ? "mt-1" : ""}`}>
            {isMobile ? (
              <>Gerenciando: {user?.nomeCondominio || 'Condomínio'}</>
            ) : (
              <>Você está gerenciando o {user?.nomeCondominio || 'Condomínio'}</>
            )}
          </p>
        </>
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'taxa_condominio': 'Taxa de Condomínio',
      'reserva_area_comum': 'Reserva Área Comum',
      'taxa_extra': 'Taxa Extra',
      'multa': 'Multa',
      'outros_receita': 'Outros (Receita)',
      'energia': 'Energia',
      'agua': 'Água',
      'manutencao': 'Manutenção',
      'gas': 'Gás',
      'limpeza': 'Limpeza',
      'produtos': 'Produtos',
      'imposto': 'Imposto',
      'seguranca': 'Segurança',
      'sistema_condominio': 'Sistema Condomínio',
      'outros_despesa': 'Outros (Despesa)'
    };
    
    return categoryMap[category] || category;
  };

  const renderContent = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          strong: ({node, ...props}) => <span className="font-bold" {...props} />,
          p: ({node, ...props}) => <div className="whitespace-pre-line mb-3" {...props} />
        }}
        className="whitespace-pre-line"
      >
        {content}
      </ReactMarkdown>
    );
  };

  const renderAdminDashboard = () => {
    const { stats, isLoading } = useManagerStats();
    
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover border-t-4 border-t-brand-600 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Status dos Gestores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <span className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-green-600" /> 
                    Ativos
                  </span>
                  <div className="text-xl font-bold">{stats.activeCount}</div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                    <UserX className="h-4 w-4 text-red-600" /> 
                    Inativos
                  </span>
                  <div className="text-xl font-bold">{stats.inactiveCount}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-center">
                  <span className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Sem login há 10+ dias
                  </span>
                  <div className="text-xl font-bold text-amber-600">
                    {stats.inactiveLoginCount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-t-4 border-t-brand-600 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Preferência de Pagamento</CardTitle>
              <FileTextIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Recibo</span>
                  <div className="text-xl font-bold">{statsDetails.bankSlipPreference}</div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Nota Fiscal</span>
                  <div className="text-xl font-bold">{statsDetails.invoicePreference}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover border-t-4 border-t-brand-600 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Distribuição Regional</CardTitle>
              <MapPin className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statsDetails.regionData.map(([region, count], index) => (
                  <div key={region} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${
                        index === 0 ? "bg-green-500" :
                        index === 1 ? "bg-blue-500" :
                        index === 2 ? "bg-purple-500" :
                        index === 3 ? "bg-amber-500" :
                        "bg-gray-500"
                      }`}></div>
                      <span className="text-sm">{region}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
                {statsDetails.regionData.length === 0 && (
                  <div className="text-sm text-gray-500">Sem dados regionais</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-t-4 border-t-brand-600 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tipo de Plano</CardTitle>
              <PieChart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <PlanDistributionChart 
                data={planDistribution} 
                isLoading={isLoadingPlanData}
                viewMode="list"
              />
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  const renderResidentDashboard = () => (
    <>
      <div className="grid gap-4">
        {latestNews && (
          <Card 
            className="card-hover border-t-4 border-t-brand-600 shadow-md cursor-pointer"
            onClick={() => setNewsDialogOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">{latestNews.title}</CardTitle>
                {isRecentNews(latestNews.created_at) && (
                  <Badge variant="default" className="bg-blue-500 hover:bg-blue-500 flex items-center gap-0.5 px-1.5 py-0.5 h-5">
                    <Clock className="h-3 w-3 mr-0.5" />
                    <span>NEW</span>
                  </Badge>
                )}
              </div>
              <BellRing className="h-4 w-4 text-brand-600" />
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                {latestNews.short_description && renderContent(latestNews.short_description)}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Publicado em: {formatDate(latestNews.created_at)}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="card-hover border-t-4 border-t-brand-600 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bem-vindo ao Portal do Morador</CardTitle>
            <Home className="h-4 w-4 text-brand-600" />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              Este é o seu acesso ao portal do condomínio. Aqui você pode:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-md">
                <BellRing className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-700">Comunicados</h3>
                  <p className="text-sm text-blue-600">Fique por dentro das notícias do condomínio</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-green-50 p-3 rounded-md">
                <FileText className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-700">Documentos</h3>
                  <p className="text-sm text-green-600">Acesse regulamentos e atas</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-md">
                <Home className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-700">Áreas Comuns</h3>
                  <p className="text-sm text-amber-600">Agende o uso de áreas comuns</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-purple-50 p-3 rounded-md">
                <Bug className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-purple-700">Dedetizações</h3>
                  <p className="text-sm text-purple-600">Veja o calendário de dedetizações</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {newsDialogOpen && latestNews && (
        <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">{latestNews.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              {latestNews.full_content && renderContent(latestNews.full_content)}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Publicado em: {formatDate(latestNews.created_at)}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  const renderManagerDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {latestNews && (
          <Card 
            className="card-hover border-t-4 border-t-brand-600 shadow-md cursor-pointer"
            onClick={() => setNewsDialogOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">{latestNews.title}</CardTitle>
                {isRecentNews(latestNews.created_at) && (
                  <Badge variant="default" className="bg-blue-500 hover:bg-blue-500 flex items-center gap-0.5 px-1.5 py-0.5 h-5">
                    <Clock className="h-3 w-3 mr-0.5" />
                    <span>NEW</span>
                  </Badge>
                )}
              </div>
              <BellRing className="h-4 w-4 text-brand-600" />
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                {latestNews.short_description && renderContent(latestNews.short_description)}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Publicado em: {formatDate(latestNews.created_at)}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="card-hover border-t-4 border-t-brand-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Home className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Status de Pagamentos</h3>
              <span className="ml-auto text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {format(new Date(), 'MMMM/yyyy', { locale: ptBR })}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-100 rounded p-2">
                <p className="text-xs text-gray-500">Total de Unidades</p>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xl font-bold text-gray-800 cursor-help">
                        {unitStatusData.reduce((sum, item) => sum + item.value, 0)}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs max-h-36 overflow-y-auto">
                      <div>
                        <p className="font-semibold">Todas as Unidades:</p>
                        <div className="grid grid-cols-4 gap-1 mt-1">
                          {[...new Set([
                            ...(unitStatusData.find(item => item.name === 'Pagas')?.units || []),
                            ...(unitStatusData.find(item => item.name === 'Pendentes')?.units || [])
                          ])].sort().map((unit, idx) => (
                            <span key={idx} className="text-xs">{unit}</span>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="bg-green-100 rounded p-2">
                <p className="text-xs text-gray-500">Unidades Pagas</p>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xl font-bold text-green-600 cursor-help">
                        {unitStatusData.find(item => item.name === 'Pagas')?.value || 0}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs max-h-36 overflow-y-auto">
                      <div>
                        <p className="font-semibold text-green-600">Unidades Pagas:</p>
                        <div className="grid grid-cols-4 gap-1 mt-1">
                          {unitStatusData.find(item => item.name === 'Pagas')?.units?.map((unit, idx) => (
                            <span key={idx} className="text-xs">{unit}</span>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="bg-red-100 rounded p-2">
                <p className="text-xs text-gray-500">Unidades Pendentes</p>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xl font-bold text-red-600 cursor-help">
                        {unitStatusData.find(item => item.name === 'Pendentes')?.value || 0}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs max-h-36 overflow-y-auto">
                      <div>
                        <p className="font-semibold text-red-600">Unidades Pendentes:</p>
                        <div className="grid grid-cols-4 gap-1 mt-1">
                          {unitStatusData.find(item => item.name === 'Pendentes')?.units?.map((unit, idx) => (
                            <span key={idx} className="text-xs">{unit}</span>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover border-t-4 border-t-brand-600 shadow-md md:col-span-1">
          <CardContent className="p-4 grid gap-4">
            <div>
              <div className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                <Wallet className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                {!isFinancesLoading && balance ? (
                  <div className={`text-2xl font-bold ${BRLToNumber(balance.balance) > 0 
                    ? "text-green-600" : "text-red-600"}`}>
                    {balance.balance}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-gray-500">Saldo insuficiente</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-start justify-between">
          {getGreeting()}
        </div>

        {user?.isAdmin ? (
          renderAdminDashboard()
        ) : user?.isResident ? (
          renderResidentDashboard()
        ) : (
          renderManagerDashboard()
        )}
      </div>
      
      {user?.isAdmin && newsDialogOpen && latestNews && (
        <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">{latestNews.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              {latestNews.full_content && renderContent(latestNews.full_content)}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Publicado em: {formatDate(latestNews.created_at)}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
