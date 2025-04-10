
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

interface AuthRequiredProps {
  children: React.ReactNode;
}

const AuthRequired = ({ children }: AuthRequiredProps) => {
  const { isAuthenticated, isLoading } = useApp();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AuthRequired;
