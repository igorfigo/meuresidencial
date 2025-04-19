
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

// Import LandingPage as a separate component to ensure proper hook context
const LandingPage = React.lazy(() => import('./LandingPage'));

const Index = () => {
  const { isAuthenticated, isLoading } = useApp();
  
  if (isLoading) {
    // Show blank page while loading authentication status
    return null;
  }
  
  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show landing page for unauthenticated users
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LandingPage />
    </React.Suspense>
  );
};

export default Index;
