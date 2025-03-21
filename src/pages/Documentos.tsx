
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDocuments } from '@/hooks/use-documents';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentForm } from '@/components/documents/DocumentForm';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Documentos = () => {
  const {
    documents,
    isLoading,
    createDocument,
    updateDocument,
    deleteDocument,
    filterDocuments,
    searchTerm,
    setSearchTerm,
    filteredDocuments,
    sortOrder,
    setSortOrder,
    categoriasCount,
    docType,
    setDocType,
  } = useDocuments();

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-brand-600" />
            <h1 className="text-3xl font-bold">Documentos Úteis</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Gerencie documentos importantes do condomínio
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DocumentsList
              documents={filteredDocuments}
              isLoading={isLoading}
              onDelete={deleteDocument}
              onUpdate={updateDocument}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              categoriasCount={categoriasCount}
              docType={docType}
              setDocType={setDocType}
            />
          </div>
          <div className="lg:col-span-1">
            <Card className="p-6 border-t-4 border-t-brand-600 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Novo Documento Útil</h2>
              <DocumentForm onSubmit={createDocument} />
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentos;
