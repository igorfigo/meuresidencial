
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BusinessDocumentsList } from '@/components/business-documents/BusinessDocumentsList';
import { Button } from '@/components/ui/button';
import { FileIcon, Upload } from 'lucide-react';

const BusinessDocumentos = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Documentos do Negócio</h1>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Enviar Documento
          </Button>
        </div>
        <BusinessDocumentsList />
      </div>
    </DashboardLayout>
  );
};

export default BusinessDocumentos;
