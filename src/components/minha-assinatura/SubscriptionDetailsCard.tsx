import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlanUpgradeDialog } from './PlanUpgradeDialog';
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Receipt, Calendar, Tag, Percent, FileText, LifeBuoy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SubscriptionDetailsCardProps {
  condominiumData: any;
  user: { matricula: string; email: string };
  formatCurrencyDisplay: (value: string | null | undefined) => string;
  getCurrentPlanDetails: () => { name: string; value: string };
  pixDueDate?: string;
  onPlanUpdate?: (updatedData: any) => void;
}

export const SubscriptionDetailsCard = ({ 
  condominiumData, 
  user, 
  formatCurrencyDisplay,
  getCurrentPlanDetails,
  pixDueDate,
  onPlanUpdate
}: SubscriptionDetailsCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localCondominiumData, setLocalCondominiumData] = useState(condominiumData);
  const navigate = useNavigate();
  
  const isCnpjEmpty = !localCondominiumData.cnpj || localCondominiumData.cnpj.trim() === '';
  
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
      
      const updatedData = {
        ...localCondominiumData,
        tipodocumento: value
      };
      
      setLocalCondominiumData(updatedData);
      
      if (onPlanUpdate) {
        onPlanUpdate(updatedData);
      }
      
      await supabase.from('condominium_change_logs').insert({
        matricula: user.matricula,
        campo: 'tipodocumento',
        valor_anterior: condominiumData.tipodocumento,
        valor_novo: value,
        usuario: user.email
      });
      
      toast.success('Tipo de documento atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating document type:', error);
      toast.error('Erro ao atualizar tipo de documento');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlanUpgrade = (updatedData: any) => {
    setLocalCondominiumData(updatedData);
    
    if (onPlanUpdate) {
      onPlanUpdate(updatedData);
    }
  };
  
  const navigateToContactPage = () => {
    navigate('/contato');
  };
  
  const planDetails = getCurrentPlanDetails();

  const dueDate = pixDueDate || localCondominiumData.vencimento || '';

  return (
    <Card className="border-t-4 border-t-brand-600 shadow-sm w-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-brand-600" />
          Informações da Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-medium mb-4">Detalhes do Plano</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="planoContratado" className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Plano Contratado
                </Label>
                <Input
                  id="planoContratado"
                  value={planDetails.name}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valorPlano" className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-gray-500" />
                  Valor do Plano (R$)
                </Label>
                <Input
                  id="valorPlano"
                  value={planDetails.value}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="formaPagamento" className="flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-gray-500" />
                  Forma de Pagamento
                </Label>
                <Input
                  id="formaPagamento"
                  value={localCondominiumData.formapagamento || ''}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vencimento" className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Vencimento
                </Label>
                <Input
                  id="vencimento"
                  value={dueDate}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="desconto" className="flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-gray-500" />
                  Desconto (R$)
                </Label>
                <Input
                  id="desconto"
                  value={formatCurrencyDisplay(localCondominiumData.desconto)}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valorMensal" className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  Valor Mensal (R$)
                </Label>
                <Input
                  id="valorMensal"
                  value={formatCurrencyDisplay(localCondominiumData.valormensal)}
                  readOnly
                  className="bg-gray-50 border-gray-200 font-medium text-brand-600"
                />
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <h3 className="text-lg font-medium mb-4">Documentação Fiscal</h3>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="tipoDocumento" className="flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-gray-500" />
                Nota Fiscal / Recibo
              </Label>
              <Select 
                value={isCnpjEmpty ? 'recibo' : (localCondominiumData.tipodocumento || '')}
                onValueChange={handleTipoDocumentoChange}
                disabled={isCnpjEmpty || isLoading}
              >
                <SelectTrigger id="tipoDocumento" className="w-full">
                  <SelectValue placeholder="Selecione o tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {!isCnpjEmpty && <SelectItem value="notaFiscal">Nota Fiscal</SelectItem>}
                    <SelectItem value="recibo">Recibo</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {isCnpjEmpty && (
                <div className="mt-1 p-3 bg-amber-50 rounded-md border border-amber-100">
                  <p className="text-sm text-amber-800 font-medium">
                    CNPJ não informado. Apenas Recibo disponível.
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Para alterar este campo é necessário ter um CNPJ cadastrado. 
                    Entre em contato com o administrador através do{" "}
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-sm text-brand-600 font-medium" 
                      onClick={navigateToContactPage}
                    >
                      Fale Conosco
                    </Button>.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-8">
            <h3 className="text-lg font-medium mb-4">Ações</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Alterar Plano</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Atualize seu plano para atender melhor às necessidades do seu condomínio.
                </p>
                <PlanUpgradeDialog 
                  condominiumData={localCondominiumData}
                  userMatricula={user.matricula}
                  userEmail={user.email}
                  onPlanUpgrade={handlePlanUpgrade}
                  formatCurrencyDisplay={formatCurrencyDisplay}
                />
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Cancelar Assinatura</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Cancele sua assinatura. Esta ação desativará sua conta e de todos moradores.
                </p>
                <CancelSubscriptionDialog 
                  condominiumMatricula={user.matricula}
                  userEmail={user.email}
                />
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Precisa de ajuda?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Entre em contato com nosso time de suporte para qualquer dúvida ou assistência.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2 border-brand-200 hover:bg-brand-50"
                  onClick={navigateToContactPage}
                >
                  <LifeBuoy className="h-4 w-4 text-brand-600" />
                  <span>Fale com o Suporte</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
