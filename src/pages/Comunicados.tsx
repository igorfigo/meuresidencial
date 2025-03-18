
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AnnouncementsList from '@/components/announcements/AnnouncementsList';

const Comunicados: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Comunicados</h1>
          <p className="text-muted-foreground">
            Gerencie e envie comunicados aos moradores do seu condomínio.
          </p>
        </div>
        
        <div className="border-t pt-6">
          <AnnouncementsList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Comunicados;
