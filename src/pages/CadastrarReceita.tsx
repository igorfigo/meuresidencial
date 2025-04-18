
import DashboardLayout from '@/components/DashboardLayout';
import { FormattedRevenueForm } from '@/components/revenue/FormattedRevenueForm';

const CadastrarReceita = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Cadastrar Receita</h1>
        <FormattedRevenueForm />
      </div>
    </DashboardLayout>
  );
};

export default CadastrarReceita;
