
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DatabaseBackup from '@/components/DatabaseBackup';
import AdminOnly from '@/components/AdminOnly';

const AdminTools = () => {
  return (
    <DashboardLayout>
      <AdminOnly>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Ferramentas Administrativas</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatabaseBackup />
            
            {/* Additional admin tools can be added here in the future */}
          </div>
        </div>
      </AdminOnly>
    </DashboardLayout>
  );
};

export default AdminTools;
