
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Receipt, FileText, FileIcon } from 'lucide-react';

const BusinessManagement = () => {
  const navigate = useNavigate();

  const businessModules = [
    {
      title: 'Despesas da Empresa',
      description: 'Gerenciar todas as despesas relacionadas ao negócio',
      icon: <Receipt className="h-8 w-8 text-blue-500" />,
      path: '/business-management/despesas',
    },
    {
      title: 'Contratos',
      description: 'Gerenciar contratos com fornecedores e clientes',
      icon: <FileText className="h-8 w-8 text-green-500" />,
      path: '/business-management/contratos',
    },
    {
      title: 'Documentos',
      description: 'Armazenar e gerenciar documentos importantes da empresa',
      icon: <FileIcon className="h-8 w-8 text-purple-500" />,
      path: '/business-management/documentos',
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Business Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessModules.map((module, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {module.icon}
                  <CardTitle>{module.title}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(module.path)}
                >
                  Acessar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessManagement;
