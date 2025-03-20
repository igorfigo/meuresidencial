
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from '@/components/DashboardLayout';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useApp } from "@/contexts/AppContext";

const MinhaAssinatura = () => {
  const { user } = useApp();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('Nota Fiscal');
  const [selectedPlan, setSelectedPlan] = useState('Básico');
  const [upgradeDialog, setUpgradeDialog] = useState(false);

  // Plans data
  const plans = [
    { id: 'basico', name: 'Básico', price: 99.90, discount: 0, finalPrice: 99.90 },
    { id: 'intermediario', name: 'Intermediário', price: 199.90, discount: 10, finalPrice: 189.90 },
    { id: 'premium', name: 'Premium', price: 299.90, discount: 20, finalPrice: 279.90 },
  ];

  // Current plan (would come from user context in a real app)
  const currentPlan = plans[0];
  
  // Selected plan for upgrade
  const [upgradePlan, setUpgradePlan] = useState(plans[0]);

  const handlePasswordChange = () => {
    // Password change logic would go here
    console.log("Password change requested", { currentPassword, newPassword, confirmPassword });
    // Reset fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    // Show success notification
  };

  const handleDocTypeChange = (value: string) => {
    setSelectedDocType(value);
    // Save doc type preference logic would go here
  };

  const handlePlanChange = (value: string) => {
    const selected = plans.find(plan => plan.id === value) || plans[0];
    setUpgradePlan(selected);
  };

  const confirmUpgrade = () => {
    // Upgrade plan logic would go here
    console.log("Plan upgrade confirmed", { from: currentPlan, to: upgradePlan });
    setUpgradeDialog(false);
    // Show success notification
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Minha Assinatura</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password Change Card */}
          <Card className="shadow-md border-t-[6px] border-t-brand-400">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha de acesso ao sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handlePasswordChange}>Alterar Senha</Button>
            </CardFooter>
          </Card>

          {/* Subscription Info Card */}
          <Card className="shadow-md border-t-[6px] border-t-brand-400">
            <CardHeader>
              <CardTitle>Plano / Contrato</CardTitle>
              <CardDescription>Informações sobre sua assinatura atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-type">Plano</Label>
                <Input id="plan-type" value={currentPlan.name} readOnly className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-price">Valor do Plano (R$)</Label>
                <Input id="plan-price" value={currentPlan.price.toFixed(2)} readOnly className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-discount">Desconto (R$)</Label>
                <Input id="plan-discount" value={currentPlan.discount.toFixed(2)} readOnly className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-final">Valor Mensal (R$)</Label>
                <Input id="plan-final" value={currentPlan.finalPrice.toFixed(2)} readOnly className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-type">Nota Fiscal / Recibo</Label>
                <Select onValueChange={handleDocTypeChange} defaultValue={selectedDocType}>
                  <SelectTrigger id="doc-type">
                    <SelectValue placeholder="Selecione o tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nota Fiscal">Nota Fiscal</SelectItem>
                    <SelectItem value="Recibo">Recibo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog open={upgradeDialog} onOpenChange={setUpgradeDialog}>
                <DialogTrigger asChild>
                  <Button>Realizar Upgrade do Plano</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upgrade de Plano</DialogTitle>
                    <DialogDescription>
                      Selecione o novo plano desejado para sua assinatura.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="upgrade-plan">Plano Contratado</Label>
                      <Select onValueChange={handlePlanChange} defaultValue={upgradePlan.id}>
                        <SelectTrigger id="upgrade-plan">
                          <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map(plan => (
                            <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upgrade-price">Valor do Plano (R$)</Label>
                      <Input id="upgrade-price" value={upgradePlan.price.toFixed(2)} readOnly className="bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upgrade-discount">Desconto (R$)</Label>
                      <Input id="upgrade-discount" value={upgradePlan.discount.toFixed(2)} readOnly className="bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upgrade-final">Valor Mensal (R$)</Label>
                      <Input id="upgrade-final" value={upgradePlan.finalPrice.toFixed(2)} readOnly className="bg-gray-100" />
                    </div>
                  </div>
                  <DialogFooter>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button>Salvar Alterações</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Mudança de Plano</AlertDialogTitle>
                          <AlertDialogDescription>
                            Você está alterando seu plano de <strong>{currentPlan.name}</strong> (R$ {currentPlan.finalPrice.toFixed(2)}/mês) para <strong>{upgradePlan.name}</strong> (R$ {upgradePlan.finalPrice.toFixed(2)}/mês).
                            <br /><br />
                            Deseja confirmar esta alteração?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmUpgrade}>Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MinhaAssinatura;
