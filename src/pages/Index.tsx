import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import LandingPage from './LandingPage';

const Index = () => {
  const { isAuthenticated, isLoading } = useApp();
  
  if (isLoading) {
    // Show blank page while loading authentication status
    return null;
  }
  
  // If user is authenticated, redirect to dashboard
  // Otherwise, show the landing page directly
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show landing page for unauthenticated users
  return <LandingPage />;
};

export default Index;
