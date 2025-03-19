
import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

import { AppProvider } from './contexts/AppContext';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Moradores from './pages/Moradores';
import NotFound from './pages/NotFound';
import Comunicados from './pages/Comunicados';
import AreasComuns from './pages/AreasComuns';
import Documentos from './pages/Documentos';
import Dedetizacoes from './pages/Dedetizacoes';
import CadastroGestor from './pages/CadastroGestor';
import CadastroPlanos from './pages/CadastroPlanos';
import UnderConstruction from './pages/UnderConstruction';
import FaleConosco from './pages/FaleConosco';

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <RouterProvider router={createBrowserRouter([
            {
              path: "/",
              element: <Index />,
            },
            {
              path: "/login",
              element: <Login />,
            },
            {
              path: "/cadastro-gestor",
              element: <CadastroGestor />,
            },
            {
              path: "/cadastro-planos",
              element: <CadastroPlanos />,
            },
            {
              path: "/dashboard",
              element: (
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              ),
            },
            {
              path: "/moradores",
              element: (
                <ProtectedRoute>
                  <DashboardLayout>
                    <Moradores />
                  </DashboardLayout>
                </ProtectedRoute>
              ),
            },
            {
              path: "/comunicados",
              element: (
                <ProtectedRoute>
                  <DashboardLayout>
                    <Comunicados />
                  </DashboardLayout>
                </ProtectedRoute>
              ),
            },
            {
              path: "/areas-comuns",
              element: (
                <ProtectedRoute>
                  <DashboardLayout>
                    <AreasComuns />
                  </DashboardLayout>
                </ProtectedRoute>
              ),
            },
            {
              path: "/documentos",
              element: (
                <ProtectedRoute>
                  <DashboardLayout>
                    <Documentos />
                  </DashboardLayout>
                </ProtectedRoute>
              ),
            },
            {
              path: "/dedetizacoes",
              element: (
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dedetizacoes />
                  </DashboardLayout>
                </ProtectedRoute>
              ),
            },
            {
              path: "/em-construcao",
              element: (
                <ProtectedRoute>
                  <DashboardLayout>
                    <UnderConstruction />
                  </DashboardLayout>
                </ProtectedRoute>
              ),
            },
            {
              path: "/fale-conosco",
              element: (
                <ProtectedRoute>
                  <DashboardLayout>
                    <FaleConosco />
                  </DashboardLayout>
                </ProtectedRoute>
              ),
            },
            {
              path: "*",
              element: <NotFound />,
            },
          ])} />
          <Toaster />
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
