import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Servicos from './pages/Servicos';
import FaleConosco from './pages/FaleConosco';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Moradores from './pages/Moradores';
import Comunicados from './pages/Comunicados';
import Dedetizacoes from './pages/Dedetizacoes';
import Documentos from './pages/Documentos';
import AreasComuns from './pages/AreasComuns';
import VagaGaragem from './pages/VagaGaragem';
import MinhaAssinatura from './pages/MinhaAssinatura';
import DadosHistoricos from './pages/DadosHistoricos';
import DuvidasFrequentes from './pages/DuvidasFrequentes';
import SugestaoReclamacao from './pages/SugestaoReclamacao';
import MinhasCobrancas from './pages/MinhasCobrancas';
import GaragemLivre from './pages/GaragemLivre';
import FinanceiroDashboard from './pages/FinanceiroDashboard';
import FinanceiroReceitasDespesas from './pages/FinanceiroReceitasDespesas';
import FinanceiroRecebimentoPix from './pages/FinanceiroRecebimentoPix';
import FinanceiroPrestacaoContas from './pages/FinanceiroPrestacaoContas';
import CadastroGestor from './pages/CadastroGestor';
import CadastroPlanos from './pages/CadastroPlanos';
import CadastroChavePix from './pages/CadastroChavePix';
import GerenciarAvisos from './pages/GerenciarAvisos';
import BusinessManagement from './pages/BusinessManagement';
import BusinessContratos from './pages/BusinessContratos';
import BusinessDocuments from './pages/BusinessDocuments';
import BusinessCost from './pages/BusinessCost';
import VpsOverview from './pages/VpsOverview';
import NotFound from './pages/NotFound';
import { AppProvider } from './contexts/AppContext';
import { AuthRequired } from './components/AuthRequired';
import { AdminOnly } from './components/AdminOnly';
import { Toaster } from "@/components/ui/toaster"
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Preventivas } from './pages';

const queryClient = new QueryClient()

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <BrowserRouter>
            <ThemeProvider defaultTheme="light" storageKey="theme-preference">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/servicos" element={<Servicos />} />
                <Route path="/fale-conosco" element={<FaleConosco />} />
                
                {/* Protected Routes */}
                <Route element={<AuthRequired />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/perfil" element={<UserProfile />} />
                  <Route path="/moradores" element={<Moradores />} />
                  <Route path="/comunicados" element={<Comunicados />} />
                  <Route path="/dedetizacoes" element={<Dedetizacoes />} />
                  <Route path="/preventivas" element={<Preventivas />} />
                  <Route path="/documentos" element={<Documentos />} />
                  <Route path="/areas-comuns" element={<AreasComuns />} />
                  <Route path="/vaga-garagem" element={<VagaGaragem />} />
                  <Route path="/minha-assinatura" element={<MinhaAssinatura />} />
                  <Route path="/dados-historicos" element={<DadosHistoricos />} />
                  <Route path="/duvidas-frequentes" element={<DuvidasFrequentes />} />
                  <Route path="/sugestao-reclamacao" element={<SugestaoReclamacao />} />
                  <Route path="/minhas-cobrancas" element={<MinhasCobrancas />} />
                  <Route path="/garagem-livre" element={<GaragemLivre />} />
                  
                  {/* Finance Routes */}
                  <Route path="/financeiro/dashboard" element={<FinanceiroDashboard />} />
                  <Route path="/financeiro/receitas-despesas" element={<FinanceiroReceitasDespesas />} />
                  <Route path="/financeiro/recebimento-pix" element={<FinanceiroRecebimentoPix />} />
                  <Route path="/financeiro/prestacao-contas" element={<FinanceiroPrestacaoContas />} />
                  
                  {/* Admin Only Routes */}
                  <Route element={<AdminOnly />}>
                    <Route path="/cadastro-gestor" element={<CadastroGestor />} />
                    <Route path="/cadastro-planos" element={<CadastroPlanos />} />
                    <Route path="/cadastro-chave-pix" element={<CadastroChavePix />} />
                    <Route path="/gerenciar-avisos" element={<GerenciarAvisos />} />
                    <Route path="/business-management" element={<BusinessManagement />} />
                    <Route path="/contratos" element={<BusinessContratos />} />
                    <Route path="/business-documents" element={<BusinessDocuments />} />
                    <Route path="/despesas-empresariais" element={<BusinessCost />} />
                    <Route path="/vps-overview" element={<VpsOverview />} />
                  </Route>
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </ThemeProvider>
          </BrowserRouter>
        </AppProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
