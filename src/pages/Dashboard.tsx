import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Users, FileText, MapPin, Wallet, Home, Bug, BellRing, FileCheck, Receipt, PiggyBank, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatToBRL } from '@/utils/currency';
import { useFinances } from '@/hooks/use-finances';
import { BalanceDisplay } from '@/components/financials/BalanceDisplay';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

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
  
  const [stats, setStats] = useState<DashboardStats>({
    activeManagers: 0,
    invoicePreference: 0,
    locationStats: {
      states: [],
      cities: {},
      neighborhoods: []
    }
  });
  
  useEffect(() => {
    fetchDashboardData();
    if (!user?.isAdmin) {
      fetchLatestNews();
      fetchResidentCount();
      fetchCommonAreasCount();
      fetchRecentItems();
      fetchUnitPaymentStatus();
    }
  }, [user?.isAdmin, user?.selectedCondominium]);
  
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
        .select('id, empresa, data, created_at')
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
          title: `Dedetização: ${item.empresa}`,
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

  async function fetchDashboardData() {
    try {
      const { count: activeCount, error: activeError } = await supabase
        .from('condominiums')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);
      
      if (activeError) throw activeError;
      
      const { count: invoiceCount, error: invoiceError } = await supabase
        .from('condominiums')
        .select('*', { count: 'exact', head: true })
        .eq('tipodocumento', 'notaFiscal');
      
      if (invoiceError) throw invoiceError;
      
      const { data: locationData, error: locationError } = await supabase
        .from('condominiums')
        .select('estado, cidade, bairro');
      
      if (locationError) throw locationError;
      
      const stateCount: Record<string, number> = {};
      const cityByState: Record<string, Record<string, number>> = {};
      const neighborhoodCount: Record<string, number> = {};
      
      locationData.forEach(item => {
        if (item.estado) {
          stateCount[item.estado] = (stateCount[item.estado] || 0) + 1;
          
          if (item.cidade) {
            if (!cityByState[item.estado]) {
              cityByState[item.estado] = {};
            }
            cityByState[item.estado][item.cidade] = (cityByState[item.estado][item.cidade] || 0) + 1;
          }
        }
        
        if (item.cidade) {
        }
        
        if (item.bairro) {
          neighborhoodCount[item.bairro] = (neighborhoodCount[item.bairro] || 0) + 1;
        }
      });
      
      const topStates = Object.entries(stateCount)
        .sort((a, b) => b[1] - a[1]);
          
      const citiesByState: Record<string, [string, number][]> = {};
      Object.entries(cityByState).forEach(([state, cities]) => {
        citiesByState[state] = Object.entries(cities).sort((a, b) => b[1] - a[1]);
      });
      
      const topNeighborhoods = Object.entries(neighborhoodCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      setStats({
        activeManagers: activeCount || 0,
        invoicePreference: invoiceCount || 0,
        locationStats: {
          states: topStates,
          cities: citiesByState,
          neighborhoods: topNeighborhoods
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

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
    } else {
      return (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            Olá {user?.nome || 'Representante'}
          </h1>
          <p className="text-muted-foreground">
            Você está gerenciando o {user?.nomeCondominio || 'Condomínio'}
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

  const renderAdminDashboard = () => (
    <>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover border-t-4 border-t-brand-600 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gestores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeManagers}</div>
            <p className="text-xs text-muted-foreground">
              Gestores com status ativo no sistema
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-t-4 border-t-brand-600 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Preferência por Nota Fiscal</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invoicePreference}</div>
            <p className="text-xs text-muted-foreground">
              Gestores que optam por nota fiscal
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-t-4 border-t-brand-600 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Distribuição Geográfica</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <h4 className="text-sm font-medium text-muted-foreground">Por Estado</h4>
              <ul className="text-sm mt-1">
                {stats.locationStats.states.map(([state, count]) => (
                  <li 
                    key={state} 
                    className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => handleStateClick(state)}
                  >
                    <span>{state}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
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
              <CardTitle className="text-sm font-medium">{latestNews.title}</CardTitle>
              <BellRing className="h-4 w-4 text-brand-600" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{latestNews.short_description}</p>
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
                  <div className="text-2xl font-bold">
                    {balance.is_manual ? 'R$ ' + balance.balance : 'R$ ' + balance.balance}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-gray-400">Carregando...</div>
                )}
              </div>
            </div>
            
            <Separator className="my-1" />
            
            <div>
              <div className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Dados do Condomínio</CardTitle>
                <Home className="h-4 w-4 text-brand-600" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" /> Moradores
                  </span>
                  <span className="font-medium">{residentCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Home className="h-4 w-4" /> Áreas Comuns
                  </span>
                  <span className="font-medium">{commonAreasCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-t-4 border-t-brand-600 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Movimentações Financeiras</CardTitle>
            <div className="flex gap-1">
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions
                  .slice(0, 5)
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-1 border-b last:border-b-0">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          {transaction.type === 'income' ? (
                            <ArrowUpCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                          ) : (
                            <ArrowDownCircle className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium truncate max-w-[120px]">{transaction.category}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {transaction.unit ? `Unidade: ${transaction.unit}` : 'Geral'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {transaction.payment_date 
                            ? formatDate(transaction.payment_date) 
                            : (transaction.due_date 
                                ? formatDate(transaction.due_date) 
                                : '-')}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-sm text-muted-foreground">Nenhuma movimentação registrada</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-t-4 border-t-brand-600 shadow-md h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Últimos Cadastros</CardTitle>
            <FileCheck className="h-4 w-4 text-brand-600" />
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-3">
            <div className="space-y-0.5 h-full flex flex-col">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1.5 border-b last:border-b-0">
                    <div className="flex items-center gap-1.5">
                      {item.type === 'announcement' && <BellRing className="h-3.5 w-3.5 text-blue-500" />}
                      {item.type === 'document' && <FileText className="h-3.5 w-3.5 text-green-500" />}
                      {item.type === 'pest-control' && <Bug className="h-3.5 w-3.5 text-red-500" />}
                      <span className="text-sm truncate max-w-[180px]">{item.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground flex items-center justify-center h-full">
                  Nenhum cadastro recente
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 pb-6 animate-fade-in">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-2">
              <span className="mr-2">👋</span>
              <span>Bem-vindo de volta</span>
            </div>
            {getGreeting()}
          </div>
        </header>

        <Separator className="mb-6" />

        {user?.isAdmin ? renderAdminDashboard() : renderManagerDashboard()}
      </div>

      <Sheet open={isStateDetailOpen} onOpenChange={setIsStateDetailOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Cidades em {selectedState}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedState && stats.locationStats.cities[selectedState] ? (
              <ul className="space-y-2">
                {stats.locationStats.cities[selectedState].map(([city, count]) => (
                  <li key={city} className="flex justify-between items-center py-2 border-b">
                    <span>{city}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Sem dados de cidades para este estado.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {latestNews && (
        <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{latestNews.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <p className="text-muted-foreground">
                {latestNews.full_content}
              </p>
              <div className="text-sm text-gray-500">
                Publicado em: {formatDate(latestNews.created_at)}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setNewsDialogOpen(false)}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
