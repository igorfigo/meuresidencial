
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { SubscriptionDetailsCard } from '@/components/minha-assinatura/SubscriptionDetailsCard';
import { PasswordChangeSection } from '@/components/minha-assinatura/PasswordChangeSection';
import { PlanUpgradeDialog } from '@/components/minha-assinatura/PlanUpgradeDialog';
import { getSubscriptionStatus } from '@/utils/subscription-utils';
import { usePlans } from '@/hooks/use-plans';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const MinhaAssinatura = () => {
  const { user, updateSubscription } = useApp();
  const { plans, isLoading: isLoadingPlans } = usePlans();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const status = getSubscriptionStatus(user);
      setSubscriptionStatus(status);
    }
  }, [user]);

  const handleOpenDialog = (planId: string) => {
    setSelectedPlanId(planId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPlanId(null);
  };

  const handlePlanUpgrade = async () => {
    if (!selectedPlanId) {
      toast.error('Por favor, selecione um plano para atualizar.');
      return;
    }

    try {
      const selectedPlan = plans?.find(plan => plan.codigo === selectedPlanId);

      if (!selectedPlan) {
        toast.error('Plano selecionado não encontrado.');
        return;
      }

      if (!user) {
        toast.error('Usuário não autenticado.');
        return;
      }

      const updatedUser = {
        ...user,
        planId: selectedPlan.codigo,
        nomePlano: selectedPlan.nome,
        valorPlano: selectedPlan.valor.replace('R$ ', ''),
      };

      await updateSubscription(updatedUser);

      toast.success('Plano atualizado com sucesso!');
      handleCloseDialog();
    } catch (error: any) {
      console.error('Erro ao atualizar o plano:', error);
      toast.error('Erro ao atualizar o plano. Por favor, tente novamente.');
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-2">Minha Assinatura</h1>
        <Separator className="mb-6" />

        <SubscriptionDetailsCard
          user={user}
          subscriptionStatus={subscriptionStatus}
          onUpgradePlan={handleOpenDialog}
          isLoading={isLoadingPlans}
        />

        {user?.matricula && (
          <PasswordChangeSection userMatricula={user.matricula} />
        )}

        <PlanUpgradeDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onUpgrade={handlePlanUpgrade}
          plans={plans || []}
          selectedPlanId={selectedPlanId || ''}
          isLoading={isLoadingPlans}
        />
      </div>
    </DashboardLayout>
  );
};

export default MinhaAssinatura;
