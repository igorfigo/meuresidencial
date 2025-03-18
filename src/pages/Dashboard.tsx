
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, MapPin } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define type for the location stats
interface LocationStats {
  states: [string, number][];
  cities: [string, number][];
  neighborhoods: [string, number][];
}

// Define type for the stats state
interface DashboardStats {
  activeManagers: number;
  invoicePreference: number;
  locationStats: LocationStats;
}

const Dashboard = () => {
  const { user } = useApp();
  const firstName = user?.nome?.split(' ')[0] || 'Usuário';
  
  const [stats, setStats] = useState<DashboardStats>({
    activeManagers: 0,
    invoicePreference: 0,
    locationStats: {
      states: [],
      cities: [],
      neighborhoods: []
    }
  });
  
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch active managers count
        const { count: activeCount, error: activeError } = await supabase
          .from('condominiums')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true);
        
        if (activeError) throw activeError;
        
        // Fetch invoice preference count
        const { count: invoiceCount, error: invoiceError } = await supabase
          .from('condominiums')
          .select('*', { count: 'exact', head: true })
          .eq('tipodocumento', 'nota_fiscal');
        
        if (invoiceError) throw invoiceError;
        
        // Fetch location stats
        const { data: locationData, error: locationError } = await supabase
          .from('condominiums')
          .select('estado, cidade, bairro');
        
        if (locationError) throw locationError;
        
        // Process location data
        const stateCount: Record<string, number> = {};
        const cityCount: Record<string, number> = {};
        const neighborhoodCount: Record<string, number> = {};
        
        locationData.forEach(item => {
          if (item.estado) {
            stateCount[item.estado] = (stateCount[item.estado] || 0) + 1;
          }
          if (item.cidade) {
            cityCount[item.cidade] = (cityCount[item.cidade] || 0) + 1;
          }
          if (item.bairro) {
            neighborhoodCount[item.bairro] = (neighborhoodCount[item.bairro] || 0) + 1;
          }
        });
        
        // Sort and get top locations
        const topStates = Object.entries(stateCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
          
        const topCities = Object.entries(cityCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
          
        const topNeighborhoods = Object.entries(neighborhoodCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        setStats({
          activeManagers: activeCount || 0,
          invoicePreference: invoiceCount || 0,
          locationStats: {
            states: topStates,
            cities: topCities,
            neighborhoods: topNeighborhoods
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }
    
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 pb-6 animate-fade-in">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-2">
              <span className="mr-2">👋</span>
              <span>Bem-vindo de volta</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Olá, {firstName}</h1>
            <p className="text-muted-foreground">Aqui está seu Dashboard Gerencial.</p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="card-hover">
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
          
          <Card className="card-hover">
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
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Distribuição Geográfica</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">Principais Localizações</div>
              
              {stats.locationStats.states && stats.locationStats.states.length > 0 ? (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Por Estado</h4>
                  <ul className="text-sm mt-1">
                    {stats.locationStats.states.map(([state, count]) => (
                      <li key={state} className="flex justify-between items-center">
                        <span>{state}</span>
                        <span className="font-medium">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Sem dados de estados</p>
              )}
              
              {stats.locationStats.cities && stats.locationStats.cities.length > 0 ? (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Por Cidade</h4>
                  <ul className="text-sm mt-1">
                    {stats.locationStats.cities.map(([city, count]) => (
                      <li key={city} className="flex justify-between items-center">
                        <span>{city}</span>
                        <span className="font-medium">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Sem dados de cidades</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
