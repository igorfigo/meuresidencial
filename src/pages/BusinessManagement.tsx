
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Receipt, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessManagement = () => {
  const navigate = useNavigate();

  const businessModules = [
    {
      title: "Despesas da Empresa",
      description: "Gerenciamento de despesas e custos operacionais",
      icon: <Receipt className="h-8 w-8 text-blue-500" />,
      path: "/business-management/despesas"
    },
    {
      title: "Contratos",
      description: "Contratos e acordos comerciais",
      icon: <FileText className="h-8 w-8 text-green-500" />,
      path: "/business-management/contratos"
    },
    {
      title: "Documentos",
      description: "Documentos e arquivos importantes da empresa",
      icon: <FileText className="h-8 w-8 text-purple-500" />,
      path: "/business-management/documentos"
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Business Management</h1>
            <p className="text-muted-foreground">Gestão de recursos da empresa</p>
          </div>
          <Briefcase className="h-10 w-10 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessModules.map((module) => (
            <Card 
              key={module.title}
              className="cursor-pointer transition-all hover:shadow-md border-l-4 border-l-brand-600"
              onClick={() => navigate(module.path)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">{module.title}</CardTitle>
                  {module.icon}
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm text-muted-foreground">
                  Clique para acessar
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessManagement;
