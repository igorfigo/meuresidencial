
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Receipt, FileContract } from 'lucide-react';

const BusinessManagement = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Gestão Administrativa</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-5 w-5" /> Despesas
              </CardTitle>
              <CardDescription>Gerenciar despesas e pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Registre, categorize e acompanhe todas as despesas do seu negócio.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/business-management/despesas">Acessar</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileContract className="mr-2 h-5 w-5" /> Contratos
              </CardTitle>
              <CardDescription>Gerenciar contratos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Acompanhe e gerencie contratos com fornecedores e parceiros.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/business-management/contratos">Acessar</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Documentos
              </CardTitle>
              <CardDescription>Gerenciar documentos administrativos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Organize todos os documentos administrativos da empresa.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/business-management/documentos">Acessar</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessManagement;
