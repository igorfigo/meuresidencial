
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Receipt } from 'lucide-react';

const BusinessManagement = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Business Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card for Expenses */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b">
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-5 w-5 text-blue-500" />
                Despesas da Empresa
              </CardTitle>
              <CardDescription>
                Gerencie as despesas operacionais da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cadastre, visualize e gerencie todas as despesas relacionadas à operação da empresa.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/business-management/despesas')}
              >
                Acessar
              </Button>
            </CardFooter>
          </Card>

          {/* Card for Contracts */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-green-500" />
                Contratos
              </CardTitle>
              <CardDescription>
                Gerencie contratos e documentação legal
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Acompanhe os contratos ativos, vencimentos e toda a documentação legal da empresa.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/business-management/contratos')}
              >
                Acessar
              </Button>
            </CardFooter>
          </Card>

          {/* Card for Documents */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b">
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-purple-500" />
                Documentos
              </CardTitle>
              <CardDescription>
                Repositório de documentos da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Armazene e organize documentos importantes da empresa em um repositório centralizado.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/business-management/documentos')}
              >
                Acessar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessManagement;
