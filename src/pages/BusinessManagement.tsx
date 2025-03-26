
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
          <h1 className="text-2xl font-bold mb-6">Business Management</h1>

          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="documents">
                <File className="h-4 w-4 mr-2" />
                Repositório de Documentos
              </TabsTrigger>
              <TabsTrigger value="overview">
                <FolderArchive className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="documents">
              <BusinessDocumentRepository />
            </TabsContent>
            
            <TabsContent value="overview">
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-yellow-700">Esta funcionalidade está em desenvolvimento.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AdminOnly>
  );
};

export default BusinessManagement;
