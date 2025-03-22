
import React, { useState } from 'react';
import { 
  Dialog, 
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
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Plan } from '@/hooks/use-plans';

interface PlanUpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
  plans: Plan[];
  selectedPlanId: string;
  isLoading: boolean;
}

export const PlanUpgradeDialog: React.FC<PlanUpgradeDialogProps> = ({
  open,
  onClose,
  onUpgrade,
  plans,
  selectedPlanId,
  isLoading
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await onUpgrade();
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              Escolha um dos planos disponíveis abaixo para atualizar sua assinatura.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={selectedPlanId} onValueChange={(value) => onUpgrade()}>
              {plans.map((plan) => (
                <div key={plan.codigo} className="flex items-start space-x-3 space-y-3">
                  <RadioGroupItem value={plan.codigo} id={plan.codigo} />
                  <div className="grid gap-1.5">
                    <Label htmlFor={plan.codigo} className="font-medium">
                      {plan.nome} - {plan.valor}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {plan.descricao || 'Sem descrição disponível'}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => setShowConfirmation(true)}>Atualizar Plano</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de plano</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja alterar seu plano? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpgrade} disabled={isUpgrading}>
              {isUpgrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
