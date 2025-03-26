
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminOnly from '@/components/AdminOnly';
import { BusinessDocumentRepository } from '@/components/business/BusinessDocumentRepository';

const BusinessManagement = () => {
  return (
    <AdminOnly>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <BusinessDocumentRepository />
        </div>
      </DashboardLayout>
    </AdminOnly>
  );
};

export default BusinessManagement;
