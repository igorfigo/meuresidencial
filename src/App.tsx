import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppProvider } from '@/contexts/AppContext';
import { queryClient } from '@/lib/react-query';
import AuthRequired from '@/components/AuthRequired';
import AdminOnly from '@/components/AdminOnly';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import UserProfile from '@/pages/UserProfile';
import FinanceiroDashboard from '@/pages/FinanceiroDashboard';
import FinanceiroReceitasDespesas from '@/pages/FinanceiroReceitasDespesas';
import FinanceiroRecebimentoPix from '@/pages/FinanceiroRecebimentoPix';
import FinanceiroPrestacaoContas from '@/pages/FinanceiroPrestacaoContas';
import CadastroGestor from '@/pages/CadastroGestor';
import CadastroPlanos from '@/pages/CadastroPlanos';
import CadastroChavePix from '@/pages/CadastroChavePix';
import Moradores from '@/pages/Moradores';
import Comunicados from '@/pages/Comunicados';
import Documentos from '@/pages/Documentos';
import AreasComuns from '@/pages/AreasComuns';
import Dedetizacoes from '@/pages/Dedetizacoes';
import MinhaAssinatura from '@/pages/MinhaAssinatura';
import FaleConosco from '@/pages/FaleConosco';
import GerenciarAvisos from '@/pages/GerenciarAvisos';
import MinhasCobrancas from '@/pages/MinhasCobrancas';
import BusinessContratos from '@/pages/BusinessContratos';
import BusinessDocuments from '@/pages/BusinessDocuments';
import BusinessCost from '@/pages/BusinessCost';
import SugestaoReclamacao from '@/pages/SugestaoReclamacao';
import GaragemLivre from '@/pages/GaragemLivre';
import BusinessManagement from '@/pages/BusinessManagement';
import DadosHistoricos from './pages/DadosHistoricos';
import VagaGaragem from './pages/VagaGaragem';
import DuvidasFrequentes from './pages/DuvidasFrequentes';
import LandingPage from './pages/LandingPage';
import TermosCondicoes from './pages/TermosCondicoes';
import TermosCondicoesPublic from './pages/TermosCondicoesPublic';
import BusinessIncomes from './pages/BusinessIncomes';

const GerarFaturas = () => <div>Gerar Faturas (Em Desenvolvimento)</div>;

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/terms" element={<TermosCondicoesPublic />} />
              <Route path="/dashboard" element={<AuthRequired><Dashboard /></AuthRequired>} />
              <Route path="/perfil" element={<AuthRequired><UserProfile /></AuthRequired>} />
              
              {/* Financeiro Routes */}
              <Route path="/financeiro/dashboard" element={<AuthRequired><FinanceiroDashboard /></AuthRequired>} />
              <Route path="/financeiro/receitas-despesas" element={<AuthRequired><FinanceiroReceitasDespesas /></AuthRequired>} />
              <Route path="/financeiro/recebimento-pix" element={<AuthRequired><FinanceiroRecebimentoPix /></AuthRequired>} />
              <Route path="/financeiro/prestacao-contas" element={<AuthRequired><FinanceiroPrestacaoContas /></AuthRequired>} />
              
              {/* Admin Routes */}
              <Route path="/cadastro-gestor" element={<AdminOnly><CadastroGestor /></AdminOnly>} />
              <Route path="/cadastro-planos" element={<AdminOnly><CadastroPlanos /></AdminOnly>} />
              <Route path="/cadastro-chave-pix" element={<AdminOnly><CadastroChavePix /></AdminOnly>} />
              <Route path="/gerar-faturas" element={<AuthRequired><GerarFaturas /></AuthRequired>} />
              <Route path="/gerenciar-avisos" element={<AuthRequired><GerenciarAvisos /></AuthRequired>} />
              <Route path="/business-management" element={<AdminOnly><BusinessManagement /></AdminOnly>} />
              <Route path="/contratos" element={<AdminOnly><BusinessContratos /></AdminOnly>} />
              <Route path="/business-documents" element={<AdminOnly><BusinessDocuments /></AdminOnly>} />
              <Route path="/despesas-empresariais" element={<AdminOnly><BusinessCost /></AdminOnly>} />
              <Route path="/business-incomes" element={<AdminOnly><BusinessIncomes /></AdminOnly>} />
              <Route path="/termos-condicoes" element={<AdminOnly><TermosCondicoes /></AdminOnly>} />
              
              {/* Manager Routes */}
              <Route path="/moradores" element={<AuthRequired><Moradores /></AuthRequired>} />
              <Route path="/comunicados" element={<AuthRequired><Comunicados /></AuthRequired>} />
              <Route path="/documentos" element={<AuthRequired><Documentos /></AuthRequired>} />
              <Route path="/areas-comuns" element={<AuthRequired><AreasComuns /></AuthRequired>} />
              <Route path="/dedetizacoes" element={<AuthRequired><Dedetizacoes /></AuthRequired>} />
              <Route path="/minha-assinatura" element={<AuthRequired><MinhaAssinatura /></AuthRequired>} />
              <Route path="/contato" element={<AuthRequired><FaleConosco /></AuthRequired>} />
              <Route path="/duvidas-frequentes" element={<AuthRequired><DuvidasFrequentes /></AuthRequired>} />
              
              {/* Resident Routes */}
              <Route path="/minhas-cobrancas" element={<AuthRequired><MinhasCobrancas /></AuthRequired>} />
              <Route path="/garagem-livre" element={<AuthRequired><GaragemLivre /></AuthRequired>} />
              <Route path="/sugestao-reclamacao" element={<AuthRequired><SugestaoReclamacao /></AuthRequired>} />
              
              {/* New Route */}
              <Route path="/dados-historicos" element={
                <AuthRequired>
                  <DadosHistoricos />
                </AuthRequired>
              } />
              <Route path="/vaga-garagem" element={
                <AuthRequired>
                  <VagaGaragem />
                </AuthRequired>
              } />
            </Routes>
            <Toaster />
          </div>
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
