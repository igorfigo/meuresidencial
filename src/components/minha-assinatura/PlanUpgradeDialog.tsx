
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlans } from '@/hooks/use-plans';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlanUpgradeDialogProps {
  condominiumData: any;
  userMatricula: string;
  userEmail: string;
  onPlanUpgrade: (updatedData: any) => void;
  formatCurrencyDisplay: (value: string | null | undefined) => string;
}

export const PlanUpgradeDialog = ({ 
  condominiumData, 
  userMatricula,
  userEmail,
  onPlanUpgrade,
  formatCurrencyDisplay 
}: PlanUpgradeDialogProps) => {
  const { plans, isLoading: isLoadingPlans, getPlanValue } = usePlans();
  
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPlanValue, setSelectedPlanValue] = useState('R$ 0,00');
  
  useEffect(() => {
    if (condominiumData?.planocontratado) {
      setSelectedPlan(condominiumData.planocontratado);
    }
  }, [condominiumData]);
  
  useEffect(() => {
    if (selectedPlan) {
      const planValue = getPlanValue(selectedPlan);
      setSelectedPlanValue(planValue);
    }
  }, [selectedPlan, getPlanValue]);
  
  const handleSavePlanUpgrade = async () => {
    setShowConfirmDialog(true);
  };
  
  const confirmPlanUpgrade = async () => {
    if (!userMatricula || !selectedPlan) return;
    
    setIsLoading(true);
    try {
      const oldPlan = condominiumData?.planocontratado || '';
      const oldPlanValue = condominiumData?.valorplano || '';
      const oldMonthlyValue = condominiumData?.valormensal || '';
      
      const planValue = BRLToNumber(selectedPlanValue);
      const discountValue = condominiumData?.desconto ? BRLToNumber(formatCurrencyDisplay(condominiumData.desconto)) : 0;
      const newMonthlyValue = `R$ ${formatToBRL(Math.max(0, planValue - discountValue))}`;
      
      const { data, error } = await supabase
        .from('condominiums')
        .update({ 
          planocontratado: selectedPlan,
          valorplano: BRLToNumber(selectedPlanValue).toString(),
          valormensal: BRLToNumber(newMonthlyValue).toString()
        })
        .eq('matricula', userMatricula)
        .select();
        
      if (error) {
        throw error;
      }
      
      const changeLogsPromises = [
        supabase.from('condominium_change_logs').insert({
          matricula: userMatricula,
          campo: 'planocontratado',
          valor_anterior: oldPlan,
          valor_novo: selectedPlan,
          usuario: userEmail
        }),
        supabase.from('condominium_change_logs').insert({
          matricula: userMatricula,
          campo: 'valorplano',
          valor_anterior: formatCurrencyDisplay(oldPlanValue),
          valor_novo: selectedPlanValue,
          usuario: userEmail
        }),
        supabase.from('condominium_change_logs').insert({
          matricula: userMatricula,
          campo: 'valormensal',
          valor_anterior: formatCurrencyDisplay(oldMonthlyValue),
          valor_novo: newMonthlyValue,
          usuario: userEmail
        })
      ];
      
      await Promise.all(changeLogsPromises);
      
      const updatedData = {
        ...condominiumData,
        planocontratado: selectedPlan,
        valorplano: BRLToNumber(selectedPlanValue).toString(),
        valormensal: BRLToNumber(newMonthlyValue).toString()
      };
      
      onPlanUpgrade(updatedData);
      
      toast.success('Plano atualizado com sucesso!');
      setShowUpgradeDialog(false);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Erro ao atualizar plano');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
      <DialogTrigger asChild>
        <Button>Realizar Upgrade do Plano</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade de Plano</DialogTitle>
          <DialogDescription>
            Selecione o novo plano desejado para o seu condomínio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="upgradePlan">Plano Contratado</Label>
            <Select 
              value={selectedPlan}
              onValueChange={setSelectedPlan}
              disabled={isLoadingPlans}
            >
              <SelectTrigger id="upgradePlan">
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {isLoadingPlans ? (
                    <SelectItem value="loading" disabled>Carregando planos...</SelectItem>
                  ) : plans.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhum plano disponível</SelectItem>
                  ) : (
                    plans.map((plan) => (
                      <SelectItem key={plan.codigo} value={plan.codigo}>
                        {plan.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="upgradePlanValue">Valor do Plano (R$)</Label>
            <Input
              id="upgradePlanValue"
              value={selectedPlanValue}
              readOnly
              className="bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="upgradeDiscount">Desconto (R$)</Label>
            <Input
              id="upgradeDiscount"
              value={formatCurrencyDisplay(condominiumData?.desconto)}
              readOnly
              className="bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="upgradeMonthlyValue">Valor Mensal (R$)</Label>
            <Input
              id="upgradeMonthlyValue"
              value={`R$ ${formatToBRL(
                Math.max(
                  0, 
                  BRLToNumber(selectedPlanValue) - 
                  (condominiumData?.desconto ? BRLToNumber(formatCurrencyDisplay(condominiumData.desconto)) : 0)
                )
              )}`}
              readOnly
              className="bg-gray-100"
            />
          </div>
        </div>
        
        <DialogFooter>
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button onClick={handleSavePlanUpgrade}>Salvar Alterações</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Alteração de Plano</AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a alterar seu plano:
                  <br /><br />
                  <strong>De:</strong> {formatCurrencyDisplay(condominiumData?.valormensal)} ({condominiumData?.planocontratado})
                  <br />
                  <strong>Para:</strong> {`R$ ${formatToBRL(
                    Math.max(
                      0, 
                      BRLToNumber(selectedPlanValue) - 
                      (condominiumData?.desconto ? BRLToNumber(formatCurrencyDisplay(condominiumData.desconto)) : 0)
                    )
                  )}`} ({selectedPlan})
                  <br /><br />
                  Deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmPlanUpgrade}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
