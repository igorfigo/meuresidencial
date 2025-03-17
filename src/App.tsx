
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import UnderConstruction from './pages/UnderConstruction';
import CadastroGestor from './pages/CadastroGestor';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './lib/auth';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <div className="w-full h-full">
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <Toaster closeButton position="top-right" />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cadastro-gestor" element={<CadastroGestor />} />
              <Route path="/pagina-em-construcao" element={<UnderConstruction />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
