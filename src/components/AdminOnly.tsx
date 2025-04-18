
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface AdminOnlyProps {
  children: React.ReactNode;
}

const AdminOnly = ({ children }: AdminOnlyProps) => {
  const { user, isAuthenticated, isLoading } = useApp();
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState<boolean | null>(null);
  
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!user?.email) return false;
      
      const { data: isAdmin, error } = await supabase
        .rpc('is_admin_user', { user_email: user.email });
        
      if (error) {
        console.error('Error verifying admin status:', error);
        return false;
      }
      
      setIsVerifiedAdmin(isAdmin);
    };
    
    if (user) {
      verifyAdminStatus();
    }
  }, [user]);
  
  if (isLoading || isVerifiedAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (!isVerifiedAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default AdminOnly;
