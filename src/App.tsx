import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/contexts/AppContext';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Moradores from '@/pages/Moradores';
import AreasComuns from '@/pages/AreasComuns';
import Documentos from '@/pages/Documentos';
import Comunicados from '@/pages/Comunicados';
import FaleConosco from '@/pages/FaleConosco';
import NotFound from '@/pages/NotFound';
import UserProfile from '@/pages/UserProfile';
import FinanceiroReceitasDespesas from '@/pages/FinanceiroReceitasDespesas';
import FinanceiroDashboard from '@/pages/FinanceiroDashboard';
import MinhaAssinatura from '@/pages/MinhaAssinatura';
import CadastroGestor from '@/pages/CadastroGestor';
import CadastroPlanos from '@/pages/CadastroPlanos';
import CadastroChavePix from '@/pages/CadastroChavePix';
import Dedetizacoes from '@/pages/Dedetizacoes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <div className="app">
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/fale-conosco" element={<FaleConosco />} />
                <Route path="/documentos" element={<Documentos />} />
                <Route path="/areas-comuns" element={<AreasComuns />} />
                <Route path="/moradores" element={<Moradores />} />
                <Route path="/comunicados" element={<Comunicados />} />
                <Route path="/dedetizacoes" element={<Dedetizacoes />} />
                <Route path="/perfil" element={<UserProfile />} />
                <Route path="/financeiro/receitas-despesas" element={<FinanceiroReceitasDespesas />} />
                <Route path="/financeiro/dashboard" element={<FinanceiroDashboard />} />
                <Route path="/minha-assinatura" element={<MinhaAssinatura />} />
                <Route path="/cadastro-gestor" element={<CadastroGestor />} />
                <Route path="/cadastro-planos" element={<CadastroPlanos />} />
                <Route path="/cadastro-chave-pix" element={<CadastroChavePix />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </ThemeProvider>
        </AppProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
