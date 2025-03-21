
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

interface AuthRequiredProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const AuthRequired = ({ children }: AuthRequiredProps) => {
  const { user, isLoading } = useApp();

  if (isLoading) {
    // Could show a loading spinner here
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthRequired;
