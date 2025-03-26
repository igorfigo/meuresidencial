
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, FileText, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessManagement = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Despesas da Empresa',
      description: 'Gerencie despesas e pagamentos da empresa',
      icon: <Receipt className="h-10 w-10 text-blue-500" />,
      path: '/business-management/despesas'
    },
    {
      title: 'Contratos',
      description: 'Acesse e gerencie contratos da empresa',
      icon: <Banknote className="h-10 w-10 text-green-500" />,
      path: '/business-management/contratos'
    },
    {
      title: 'Documentos',
      description: 'Repositório de documentos da empresa',
      icon: <FileText className="h-10 w-10 text-purple-500" />,
      path: '/business-management/documentos'
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Business Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-slate-50 pb-2">
                <CardTitle className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.title}</span>
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button 
                  onClick={() => navigate(item.path)}
                  className="w-full"
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessManagement;
