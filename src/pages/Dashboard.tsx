
import React, { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { user } = useApp();
  const isMobile = useIsMobile();
  
  // This function is used to render the greeting section
  const getGreeting = () => {
    if (!user) {
      return <div>Carregando...</div>;
    }
    
    return (
      <div className={`flex flex-col ${isMobile ? "" : ""}`}>
        <h1 className={`text-2xl font-bold tracking-tight ${isMobile ? "text-xl" : ""}`}>
          Olá {user?.nome || 'Representante'}
        </h1>
        <p className={`text-muted-foreground text-sm ${isMobile ? "mt-1 text-sm" : "hidden"}`}>
          {user?.nomeCondominio || 'Condomínio'}
        </p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 px-4 pb-6">
        {getGreeting()}
        
        {/* Rest of your dashboard content would go here */}
        
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
