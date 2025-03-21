
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import AuthRequired from '@/components/AuthRequired';
import AdminOnly from '@/components/AdminOnly';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CadastroGestor from '@/pages/CadastroGestor';
import CadastroPlanos from '@/pages/CadastroPlanos';
import CadastroChavePix from '@/pages/CadastroChavePix';
import Moradores from '@/pages/Moradores';
import Comunicados from '@/pages/Comunicados';
import Documentos from '@/pages/Documentos';
import FinanceiroDashboard from '@/pages/FinanceiroDashboard';
import FinanceiroReceitasDespesas from '@/pages/FinanceiroReceitasDespesas';
import AreasComuns from '@/pages/AreasComuns';
import Dedetizacoes from '@/pages/Dedetizacoes';
import UnderConstruction from '@/pages/UnderConstruction';
import MinhaAssinatura from '@/pages/MinhaAssinatura';
import FaleConosco from '@/pages/FaleConosco';
import UserProfile from '@/pages/UserProfile';
import NotFound from '@/pages/NotFound';
import FinanceiroPrestacaoContas from '@/pages/FinanceiroPrestacaoContas';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<AuthRequired><Dashboard /></AuthRequired>} />
          <Route path="/cadastro-gestor" element={<AuthRequired><CadastroGestor /></AuthRequired>} />
          <Route path="/cadastro-planos" element={<AuthRequired><CadastroPlanos /></AuthRequired>} />
          <Route path="/cadastro-chave-pix" element={<AuthRequired><CadastroChavePix /></AuthRequired>} />
          <Route path="/moradores" element={<AuthRequired><Moradores /></AuthRequired>} />
          <Route path="/comunicados" element={<AuthRequired><Comunicados /></AuthRequired>} />
          <Route path="/documentos" element={<AuthRequired><Documentos /></AuthRequired>} />
          <Route path="/financeiro/dashboard" element={<AuthRequired><FinanceiroDashboard /></AuthRequired>} />
          <Route path="/financeiro/receitas-despesas" element={<AuthRequired><FinanceiroReceitasDespesas /></AuthRequired>} />
          <Route path="/financeiro/prestacao-contas" element={<AuthRequired><FinanceiroPrestacaoContas /></AuthRequired>} />
          <Route path="/areas-comuns" element={<AuthRequired><AreasComuns /></AuthRequired>} />
          <Route path="/dedetizacoes" element={<AuthRequired><Dedetizacoes /></AuthRequired>} />
          <Route path="/servicos" element={<AuthRequired><UnderConstruction pageTitle="Serviços Gerais" /></AuthRequired>} />
          <Route path="/minha-assinatura" element={<AuthRequired><MinhaAssinatura /></AuthRequired>} />
          <Route path="/contato" element={<AuthRequired><FaleConosco /></AuthRequired>} />
          <Route path="/perfil" element={<AuthRequired><UserProfile /></AuthRequired>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster richColors />
    </QueryClientProvider>
  );
}

export default App;
