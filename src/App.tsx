
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppProvider } from '@/contexts/AppContext';
import { queryClient } from '@/lib/react-query';
import AuthRequired from '@/components/AuthRequired';
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

// We'll create placeholder components for the missing pages
const GerarFaturas = () => <div>Gerar Faturas (Em Desenvolvimento)</div>;
const GerenciarAvisos = () => <div>Gerenciar Avisos (Em Desenvolvimento)</div>;
const BusinessManagement = () => <div>Business Management (Em Desenvolvimento)</div>;
const BusinessDespesas = () => <div>Business Despesas (Em Desenvolvimento)</div>;
const BusinessContratos = () => <div>Business Contratos (Em Desenvolvimento)</div>;
const Servicos = () => <div>Serviços (Em Desenvolvimento)</div>;
const Contato = () => <div>Contato (Em Desenvolvimento)</div>;

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<AuthRequired><Dashboard /></AuthRequired>} />
              <Route path="/perfil" element={<AuthRequired><UserProfile /></AuthRequired>} />
              
              {/* Financeiro Routes */}
              <Route path="/financeiro/dashboard" element={<AuthRequired><FinanceiroDashboard /></AuthRequired>} />
              <Route path="/financeiro/receitas-despesas" element={<AuthRequired><FinanceiroReceitasDespesas /></AuthRequired>} />
              <Route path="/financeiro/recebimento-pix" element={<AuthRequired><FinanceiroRecebimentoPix /></AuthRequired>} />
              <Route path="/financeiro/prestacao-contas" element={<AuthRequired><FinanceiroPrestacaoContas /></AuthRequired>} />
              
              {/* Admin Routes */}
              <Route path="/cadastro-gestor" element={<AuthRequired><CadastroGestor /></AuthRequired>} />
              <Route path="/cadastro-planos" element={<AuthRequired><CadastroPlanos /></AuthRequired>} />
              <Route path="/cadastro-chave-pix" element={<AuthRequired><CadastroChavePix /></AuthRequired>} />
              <Route path="/gerar-faturas" element={<AuthRequired><GerarFaturas /></AuthRequired>} />
              <Route path="/gerenciar-avisos" element={<AuthRequired><GerenciarAvisos /></AuthRequired>} />
              <Route path="/business-management" element={<AuthRequired><BusinessManagement /></AuthRequired>} />
              <Route path="/business-management/despesas" element={<AuthRequired><BusinessDespesas /></AuthRequired>} />
              <Route path="/business-management/contratos" element={<AuthRequired><BusinessContratos /></AuthRequired>} />
              
              {/* Manager Routes */}
              <Route path="/moradores" element={<AuthRequired><Moradores /></AuthRequired>} />
              <Route path="/comunicados" element={<AuthRequired><Comunicados /></AuthRequired>} />
              <Route path="/documentos" element={<AuthRequired><Documentos /></AuthRequired>} />
              <Route path="/areas-comuns" element={<AuthRequired><AreasComuns /></AuthRequired>} />
              <Route path="/dedetizacoes" element={<AuthRequired><Dedetizacoes /></AuthRequired>} />
              <Route path="/servicos" element={<AuthRequired><Servicos /></AuthRequired>} />
              <Route path="/minha-assinatura" element={<AuthRequired><MinhaAssinatura /></AuthRequired>} />
              <Route path="/contato" element={<AuthRequired><Contato /></AuthRequired>} />
            </Routes>
            <Toaster />
          </div>
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
