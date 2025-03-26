
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, FolderArchive } from 'lucide-react';
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
