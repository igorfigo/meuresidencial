
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  
  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    // Otherwise, redirect to the landing page
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/landing');
    }
  }, [navigate, isAuthenticated]);

  return null;
};

export default Index;
