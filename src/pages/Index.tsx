
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useApp();
  
  useEffect(() => {
    // Only redirect authenticated users, show landing page to unauthenticated users
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/landing');
      }
    }
  }, [navigate, isAuthenticated, isLoading]);

  return null;
};

export default Index;
