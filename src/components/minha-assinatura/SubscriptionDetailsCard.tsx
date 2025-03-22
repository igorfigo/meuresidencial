
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { Plan } from '@/hooks/use-plans';
import { User } from '@/contexts/AppContext';

interface SubscriptionDetailsCardProps {
  user: User | null;
  subscriptionStatus: string | null;
  onUpgradePlan: (planId: string) => void;
  isLoading: boolean;
}

export const SubscriptionDetailsCard: React.FC<SubscriptionDetailsCardProps> = ({
  user,
  subscriptionStatus,
  onUpgradePlan,
  isLoading
}) => {
  return (
    <Card className="p-6 mb-6 border-t-4 border-t-brand-600">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">Detalhes da Assinatura</h2>
          <p className="text-gray-500 text-sm">Gerencie seu plano e dados de pagamento</p>
        </div>
        <div>
          {subscriptionStatus === 'active' ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Ativa
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Inativa
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Plano Atual</h3>
          <p className="font-semibold">{user?.nomePlano || 'Nenhum plano selecionado'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Valor</h3>
          <p className="font-semibold">
            {user?.valorPlano ? `R$ ${user.valorPlano}` : 'R$ 0,00'}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => user?.planId ? onUpgradePlan(user.planId) : onUpgradePlan('')}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Alterar Plano
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
