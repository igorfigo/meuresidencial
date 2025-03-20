import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CadastroGestor from "./pages/CadastroGestor";
import CadastroPlanos from "./pages/CadastroPlanos";
import CadastroChavePix from "./pages/CadastroChavePix";
import UnderConstruction from "./pages/UnderConstruction";
import NotFound from "./pages/NotFound";
import Moradores from "./pages/Moradores";
import Dedetizacoes from "./pages/Dedetizacoes";
import Documentos from "./pages/Documentos";
import Comunicados from "./pages/Comunicados";
import AreasComuns from "./pages/AreasComuns";
import FaleConosco from "./pages/FaleConosco";
import MinhaAssinatura from "./pages/MinhaAssinatura";
import FinanceiroReceitasDespesas from "./pages/FinanceiroReceitasDespesas";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useApp();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useApp();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AnimationController = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    document.body.classList.add('page-transition-enter');
    document.body.classList.add('page-transition-enter-active');
    
    const timeout = setTimeout(() => {
      document.body.classList.remove('page-transition-enter');
      document.body.classList.remove('page-transition-enter-active');
    }, 300);
    
    return () => {
      clearTimeout(timeout);
      document.body.classList.add('page-transition-exit');
      document.body.classList.add('page-transition-exit-active');
      
      setTimeout(() => {
        document.body.classList.remove('page-transition-exit');
        document.body.classList.remove('page-transition-exit-active');
      }, 300);
    };
  }, []);
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <AnimationController>
                <AuthRoute>
                  <Login />
                </AuthRoute>
              </AnimationController>
            } />
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cadastro-gestor" element={<CadastroGestor />} />
            <Route path="/minha-assinatura" element={<MinhaAssinatura />} />
            <Route path="/moradores" element={<Moradores />} />
            <Route path="/areas-comuns" element={<AreasComuns />} />
            <Route path="/comunicados" element={<Comunicados />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/dedetizacoes" element={<Dedetizacoes />} />
            <Route path="/cadastro-planos" element={<CadastroPlanos />} />
            <Route path="/cadastro-chave-pix" element={<CadastroChavePix />} />
            
            <Route path="/financeiro" element={
              <AnimationController>
                <ProtectedRoute>
                  <UnderConstruction />
                </ProtectedRoute>
              </AnimationController>
            } />
            
            <Route path="/financeiro/receitas-despesas" element={
              <AnimationController>
                <ProtectedRoute>
                  <FinanceiroReceitasDespesas />
                </ProtectedRoute>
              </AnimationController>
            } />
            
            <Route path="/financeiro/dashboard" element={
              <AnimationController>
                <ProtectedRoute>
                  <UnderConstruction />
                </ProtectedRoute>
              </AnimationController>
            } />
            
            <Route path="/financeiro/inadimplencias" element={
              <AnimationController>
                <ProtectedRoute>
                  <UnderConstruction />
                </ProtectedRoute>
              </AnimationController>
            } />
            
            <Route path="/financeiro/prestacao-contas" element={
              <AnimationController>
                <ProtectedRoute>
                  <UnderConstruction />
                </ProtectedRoute>
              </AnimationController>
            } />
            
            <Route path="/boletos" element={
              <AnimationController>
                <ProtectedRoute>
                  <UnderConstruction />
                </ProtectedRoute>
              </AnimationController>
            } />
            
            <Route path="/reservas" element={
              <AnimationController>
                <ProtectedRoute>
                  <UnderConstruction />
                </ProtectedRoute>
              </AnimationController>
            } />
            
            <Route path="/servicos" element={
              <AnimationController>
                <ProtectedRoute>
                  <UnderConstruction />
                </ProtectedRoute>
              </AnimationController>
            } />
            
            <Route path="/assembleias" element={
              <AnimationController>
                <ProtectedRoute>
                  <UnderConstruction />
                </ProtectedRoute>
              </AnimationController>
            } />
            
            <Route path="/contato" element={
              <AnimationController>
                <ProtectedRoute>
                  <FaleConosco />
                </ProtectedRoute>
              </AnimationController>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
