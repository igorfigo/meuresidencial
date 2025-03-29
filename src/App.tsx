
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { AppContext } from './contexts/AppContext';
import { useLocalStorage } from './hooks/use-local-storage';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Moradores from './pages/Moradores';
import Comunicados from './pages/Comunicados';
import Documentos from './pages/Documentos';
import FinanceiroDashboard from './pages/FinanceiroDashboard';
import FinanceiroReceitasDespesas from './pages/FinanceiroReceitasDespesas';
import FinanceiroRecebimentoPix from './pages/FinanceiroRecebimentoPix';
import FinanceiroPrestacaoContas from './pages/FinanceiroPrestacaoContas';
import AreasComuns from './pages/AreasComuns';
import Dedetizacoes from './pages/Dedetizacoes';
import Servicos from './pages/Servicos';
import MinhasCobrancas from './pages/MinhasCobrancas';
import GaragemLivre from './pages/GaragemLivre';
import SugestaoReclamacao from './pages/SugestaoReclamacao';
import UserProfile from './pages/UserProfile';
import MinhaAssinatura from './pages/MinhaAssinatura';
import DadosHistoricos from './pages/DadosHistoricos';
import FaleConosco from './pages/FaleConosco';
import CadastroGestor from './pages/CadastroGestor';
import CadastroPlanos from './pages/CadastroPlanos';
import CadastroChavePix from './pages/CadastroChavePix';
import GerenciarAvisos from './pages/GerenciarAvisos';
import BusinessManagement from './pages/BusinessManagement';
import BusinessContratos from './pages/BusinessContratos';
import BusinessCost from './pages/BusinessCost';
import NotFound from './pages/NotFound';
import { useToast } from '@/components/ui/use-toast';
import WebsiteTraffic from './pages/WebsiteTraffic';
import TrackingRoute from './components/traffic/TrackingRoute';
import AdminOnly from './components/AdminOnly';

const App: React.FC = () => {
  const [user, setUser] = useLocalStorage('user', null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [setUser]);

  const login = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    toast({
      title: "Desconectado!",
      description: "Você foi desconectado com sucesso.",
    })
  };

  const switchCondominium = (matricula: string) => {
    if (user && user.condominiums) {
      const selectedCondominium = user.condominiums.find(condo => condo.matricula === matricula);
      if (selectedCondominium) {
        const updatedUser = {
          ...user,
          selectedCondominium: selectedCondominium.matricula,
          nomeCondominio: selectedCondominium.nomeCondominio
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast({
          title: "Condomínio alterado!",
          description: `Você está gerenciando o condomínio ${selectedCondominium.nomeCondominio}.`,
        })
      }
    }
  };

  const AuthRequired = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading,
      login, 
      logout,
      switchCondominium
    }}>
      <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/track/:code" element={<TrackingRoute />} />
            
            {/* Protected routes */}
            <Route path="/" element={<AuthRequired><Outlet /></AuthRequired>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/moradores" element={<Moradores />} />
              <Route path="/comunicados" element={<Comunicados />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/financeiro/dashboard" element={<FinanceiroDashboard />} />
              <Route path="/financeiro/receitas-despesas" element={<FinanceiroReceitasDespesas />} />
              <Route path="/financeiro/recebimento-pix" element={<FinanceiroRecebimentoPix />} />
              <Route path="/financeiro/prestacao-contas" element={<FinanceiroPrestacaoContas />} />
              <Route path="/areas-comuns" element={<AreasComuns />} />
              <Route path="/dedetizacoes" element={<Dedetizacoes />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/minhas-cobrancas" element={<MinhasCobrancas />} />
              <Route path="/garagem-livre" element={<GaragemLivre />} />
              <Route path="/sugestao-reclamacao" element={<SugestaoReclamacao />} />
              <Route path="/perfil" element={<UserProfile />} />
              <Route path="/minha-assinatura" element={<MinhaAssinatura />} />
              <Route path="/dados-historicos" element={<DadosHistoricos />} />
              <Route path="/contato" element={<FaleConosco />} />
              
              {/* Admin only routes */}
              <Route path="/" element={<AdminOnly><Outlet /></AdminOnly>}>
                <Route path="/cadastro-gestor" element={<CadastroGestor />} />
                <Route path="/cadastro-planos" element={<CadastroPlanos />} />
                <Route path="/cadastro-chave-pix" element={<CadastroChavePix />} />
                <Route path="/gerenciar-avisos" element={<GerenciarAvisos />} />
                <Route path="/business-management" element={<BusinessManagement />} />
                <Route path="/contratos" element={<BusinessContratos />} />
                <Route path="/despesas-empresariais" element={<BusinessCost />} />
                <Route path="/website-traffic" element={<WebsiteTraffic />} />
              </Route>
              
              {/* Fallback for Not Found */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
