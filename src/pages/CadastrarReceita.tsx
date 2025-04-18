
import DashboardLayout from '@/components/DashboardLayout';
import { FormattedRevenueForm } from '@/components/revenue/FormattedRevenueForm';
import AdminOnly from '@/components/AdminOnly';

const CadastrarReceita = () => {
  return (
    <DashboardLayout>
      <AdminOnly>
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Cadastrar Receita</h1>
          <FormattedRevenueForm />
        </div>
      </AdminOnly>
    </DashboardLayout>
  );
};

export default CadastrarReceita;
