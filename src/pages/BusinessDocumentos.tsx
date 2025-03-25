
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BusinessDocumentsList } from '@/components/business-documents/BusinessDocumentsList';

const BusinessDocumentos = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Documentos da Empresa</h1>
        <BusinessDocumentsList />
      </div>
    </DashboardLayout>
  );
};

export default BusinessDocumentos;
