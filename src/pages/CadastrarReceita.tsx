
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FormattedRevenueForm } from '@/components/financials/FormattedRevenueForm';
import AdminOnly from '@/components/AdminOnly';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CadastrarReceita = () => {
  return (
    <DashboardLayout>
      <AdminOnly>
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <FormattedRevenueForm />
            </CardContent>
          </Card>
        </div>
      </AdminOnly>
    </DashboardLayout>
  );
};

export default CadastrarReceita;
