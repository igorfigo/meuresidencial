
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
  const [isValidatingPlan, setIsValidatingPlan] = useState(false);
  const [residentsCount, setResidentsCount] = useState(0);
  const [planError, setPlanError] = useState<string | null>(null);
  
  // Fetch the number of residents for the condominium
  const fetchResidentsCount = async () => {
    if (!userMatricula) return;
    
    try {
      const { count, error } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('matricula', userMatricula);
      
      if (error) throw error;
      
      setResidentsCount(count || 0);
    } catch (error) {
      console.error('Error fetching residents count:', error);
    }
  };
  
  useEffect(() => {
    if (showUpgradeDialog) {
      fetchResidentsCount();
    }
  }, [showUpgradeDialog, userMatricula]);
  
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
  
  // Validate if the selected plan can support the current number of residents
  const validatePlanChange = (planCode: string) => {
    setPlanError(null);
    
    if (!planCode) return true;
    
    const selectedPlanDetails = plans.find(p => p.codigo === planCode);
    
    if (selectedPlanDetails && selectedPlanDetails.max_moradores !== undefined) {
      if (residentsCount > selectedPlanDetails.max_moradores) {
        setPlanError(`Este plano suporta no máximo ${selectedPlanDetails.max_moradores} moradores. 
        Seu condomínio possui ${residentsCount} moradores cadastrados.`);
        return false;
      }
    }
    
    return true;
  };
  
  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    validatePlanChange(value);
  };
  
  const handleSavePlanUpgrade = async () => {
    setIsValidatingPlan(true);
    
    if (!validatePlanChange(selectedPlan)) {
      setIsValidatingPlan(false);
      return;
    }
    
    setIsValidatingPlan(false);
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

  // Get the max_moradores for the currently selected plan to display in the UI
  const getSelectedPlanMaxResidents = () => {
    if (!selectedPlan) return '';
    
    const selectedPlanDetails = plans.find(p => p.codigo === selectedPlan);
    return selectedPlanDetails?.max_moradores?.toString() || '';
  };

  return (
    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
      <DialogTrigger asChild>
        <Button>Alterar Plano</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alteração de Plano</DialogTitle>
          <DialogDescription>
            Selecione o novo plano desejado para o seu condomínio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="upgradePlan">Plano Contratado</Label>
            <Select 
              value={selectedPlan}
              onValueChange={handlePlanChange}
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
            {planError && (
              <p className="text-xs text-red-500 mt-1">{planError}</p>
            )}
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
            <Label htmlFor="maxResidents">Máximo de Moradores</Label>
            <Input
              id="maxResidents"
              value={getSelectedPlanMaxResidents()}
              readOnly
              className="bg-gray-100"
            />
            <p className="text-xs text-muted-foreground">
              Número atual de moradores: {residentsCount}
            </p>
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
              <Button onClick={handleSavePlanUpgrade} disabled={!!planError || isValidatingPlan}>
                {isValidatingPlan ? 'Validando...' : 'Salvar Alterações'}
              </Button>
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
