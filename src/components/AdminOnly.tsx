
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

interface AdminOnlyProps {
  children: React.ReactNode;
}

const AdminOnly = ({ children }: AdminOnlyProps) => {
  const { user, isAuthenticated, isLoading } = useApp();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Verificar se o usuário é admin (ajuste de acordo com a estrutura do seu user)
  const isAdmin = user?.isAdmin === true;
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default AdminOnly;
