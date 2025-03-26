
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Receipt } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BusinessManagement = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Gestão Empresarial</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Despesas</CardTitle>
              <CardDescription>Gerencie as despesas da empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/business-management/despesas">
                <Button className="w-full mt-2" variant="outline">
                  <Receipt className="h-4 w-4 mr-2" />
                  Acessar Despesas
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contratos</CardTitle>
              <CardDescription>Gerencie contratos da empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/business-management/contratos">
                <Button className="w-full mt-2" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Acessar Contratos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessManagement;
