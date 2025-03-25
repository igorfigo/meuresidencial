
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Receipt, FileText, FolderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const BusinessManagement = () => {
  const navigate = useNavigate();

  const businessModules = [
    {
      title: 'Despesas da Empresa',
      description: 'Gerencie as despesas e custos operacionais da empresa.',
      icon: <Receipt className="h-8 w-8 text-brand-600" />,
      path: '/business-management/despesas'
    },
    {
      title: 'Contratos',
      description: 'Cadastre e gerencie contratos com fornecedores e parceiros.',
      icon: <FileText className="h-8 w-8 text-brand-600" />,
      path: '/business-management/contratos'
    },
    {
      title: 'Documentos',
      description: 'Armazene e gerencie documentos importantes para o negócio.',
      icon: <FolderIcon className="h-8 w-8 text-brand-600" />,
      path: '/business-management/documentos'
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Gestão do Negócio</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessModules.map((module, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {module.icon}
                  <CardTitle>{module.title}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  className="w-full bg-brand-600 hover:bg-brand-700"
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
