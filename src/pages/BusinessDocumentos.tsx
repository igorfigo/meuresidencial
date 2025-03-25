
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { BusinessDocumentForm } from '@/components/business/BusinessDocumentForm';
import { BusinessDocumentsList } from '@/components/business/BusinessDocumentsList';
import { useBusinessDocuments } from '@/hooks/use-business-documents';

const BusinessDocumentos = () => {
  const { documents, isLoading, isUploading, createDocument, deleteDocument } = useBusinessDocuments();
  const [activeTab, setActiveTab] = useState<string>('lista');

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Documentos da Empresa</h1>
        
        <Tabs defaultValue="lista" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            <TabsTrigger value="lista">Lista de Documentos</TabsTrigger>
            <TabsTrigger value="cadastro">Cadastrar Documento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista" className="mt-4">
            {isLoading ? (
              <div className="text-center py-10">
                <p>Carregando documentos...</p>
              </div>
            ) : (
              <BusinessDocumentsList 
                documents={documents} 
                onDelete={deleteDocument}
              />
            )}
          </TabsContent>
          
          <TabsContent value="cadastro" className="mt-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-medium mb-4">Cadastrar Novo Documento</h2>
              <BusinessDocumentForm
                onSubmit={(data) => {
                  createDocument(data);
                  setActiveTab('lista');
                }}
                isLoading={isUploading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDocumentos;
