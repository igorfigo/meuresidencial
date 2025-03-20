
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlans } from '@/hooks/use-plans';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
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

const MinhaAssinatura = () => {
  const { user, isAuthenticated } = useApp();
  const { plans, isLoading: isLoadingPlans, getPlanValue } = usePlans();
  
  const [isLoading, setIsLoading] = useState(false);
  const [condominiumData, setCondominiumData] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPlanValue, setSelectedPlanValue] = useState('R$ 0,00');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Fetch condominium data when component mounts
  useEffect(() => {
    if (user?.matricula) {
      fetchCondominiumData(user.matricula);
    }
  }, [user]);
  
  // Update the selected plan value when a plan is selected
  useEffect(() => {
    if (selectedPlan) {
      const planValue = getPlanValue(selectedPlan);
      setSelectedPlanValue(planValue);
    }
  }, [selectedPlan, getPlanValue]);

  const fetchCondominiumData = async (matricula: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .eq('matricula', matricula)
        .single();
        
      if (error) {
        throw error;
      }
      
      setCondominiumData(data);
      // Initialize the selected plan with the current plan
      setSelectedPlan(data.planocontratado || '');
    } catch (error) {
      console.error('Error fetching condominium data:', error);
      toast.error('Erro ao carregar dados do condomínio');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('condominiums')
        .update({ 
          senha: newPassword,
          confirmarsenha: newPassword
        })
        .eq('matricula', user?.matricula)
        .select();
        
      if (error) {
        throw error;
      }
      
      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTipoDocumentoChange = async (value: string) => {
    if (!user?.matricula) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('condominiums')
        .update({ 
          tipodocumento: value 
        })
        .eq('matricula', user.matricula)
        .select();
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setCondominiumData({
        ...condominiumData,
        tipodocumento: value
      });
      
      toast.success('Tipo de documento atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating document type:', error);
      toast.error('Erro ao atualizar tipo de documento');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSavePlanUpgrade = async () => {
    // First show confirmation dialog
    setShowConfirmDialog(true);
  };
  
  const confirmPlanUpgrade = async () => {
    if (!user?.matricula || !selectedPlan) return;
    
    setIsLoading(true);
    try {
      // Calculate new monthly value based on any existing discount
      const planValue = BRLToNumber(selectedPlanValue);
      const discountValue = condominiumData?.desconto ? BRLToNumber(condominiumData.desconto) : 0;
      const newMonthlyValue = formatToBRL(Math.max(0, planValue - discountValue));
      
      const { data, error } = await supabase
        .from('condominiums')
        .update({ 
          planocontratado: selectedPlan,
          valorplano: selectedPlanValue,
          valormensal: newMonthlyValue
        })
        .eq('matricula', user.matricula)
        .select();
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setCondominiumData({
        ...condominiumData,
        planocontratado: selectedPlan,
        valorplano: selectedPlanValue,
        valormensal: newMonthlyValue
      });
      
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
  
  if (!isAuthenticated || !user || user.isAdmin) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Minha Assinatura</h1>
          <p>Esta página está disponível apenas para usuários de condomínios.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Minha Assinatura</h1>
        
        {/* Password Change Section */}
        <Card className="form-section p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleChangePassword} 
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              Alterar Senha
            </Button>
          </div>
        </Card>
        
        {/* Subscription Info Section */}
        {condominiumData && (
          <Card className="form-section p-6 mb-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Plano / Contrato</h2>
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
                        value={condominiumData?.desconto || 'R$ 0,00'}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="upgradeMonthlyValue">Valor Mensal (R$)</Label>
                      <Input
                        id="upgradeMonthlyValue"
                        value={
                          formatToBRL(
                            Math.max(
                              0, 
                              BRLToNumber(selectedPlanValue) - 
                              (condominiumData?.desconto ? BRLToNumber(condominiumData.desconto) : 0)
                            )
                          )
                        }
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
                            <strong>De:</strong> {condominiumData?.valormensal || 'R$ 0,00'} ({condominiumData?.planocontratado})
                            <br />
                            <strong>Para:</strong> {
                              formatToBRL(
                                Math.max(
                                  0, 
                                  BRLToNumber(selectedPlanValue) - 
                                  (condominiumData?.desconto ? BRLToNumber(condominiumData.desconto) : 0)
                                )
                              )
                            } ({selectedPlan})
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planoContratado">Plano Contratado</Label>
                <Input
                  id="planoContratado"
                  value={
                    plans.find(p => p.codigo === condominiumData.planocontratado)?.nome || 
                    condominiumData.planocontratado || 
                    ''
                  }
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valorPlano">Valor do Plano (R$)</Label>
                <Input
                  id="valorPlano"
                  value={condominiumData.valorplano || 'R$ 0,00'}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Input
                  id="formaPagamento"
                  value={condominiumData.formapagamento || ''}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vencimento">Vencimento</Label>
                <Input
                  id="vencimento"
                  value={condominiumData.vencimento || ''}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="desconto">Desconto (R$)</Label>
                <Input
                  id="desconto"
                  value={condominiumData.desconto || 'R$ 0,00'}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
                <Input
                  id="valorMensal"
                  value={condominiumData.valormensal || 'R$ 0,00'}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">Nota Fiscal / Recibo</Label>
                <Select 
                  value={condominiumData.tipodocumento || ''}
                  onValueChange={handleTipoDocumentoChange}
                >
                  <SelectTrigger id="tipoDocumento">
                    <SelectValue placeholder="Selecione o tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="notaFiscal">Nota Fiscal</SelectItem>
                      <SelectItem value="recibo">Recibo</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MinhaAssinatura;
