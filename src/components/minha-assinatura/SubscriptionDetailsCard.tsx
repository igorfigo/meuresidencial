
import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlanUpgradeDialog } from './PlanUpgradeDialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SubscriptionDetailsCardProps {
  condominiumData: any;
  user: { matricula: string; email: string };
  formatCurrencyDisplay: (value: string | null | undefined) => string;
  getCurrentPlanDetails: () => { name: string; value: string };
}

export const SubscriptionDetailsCard = ({ 
  condominiumData, 
  user, 
  formatCurrencyDisplay,
  getCurrentPlanDetails
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
      
      setLocalCondominiumData({
        ...localCondominiumData,
        tipodocumento: value
      });
      
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
  };
  
  const navigateToContactPage = () => {
    navigate('/contato');
  };
  
  const planDetails = getCurrentPlanDetails();

  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Plano / Contrato</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="planoContratado">Plano Contratado</Label>
          <Input
            id="planoContratado"
            value={planDetails.name}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="valorPlano">Valor do Plano (R$)</Label>
          <Input
            id="valorPlano"
            value={planDetails.value}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
          <Input
            id="formaPagamento"
            value={localCondominiumData.formapagamento || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vencimento">Vencimento</Label>
          <Input
            id="vencimento"
            value={localCondominiumData.vencimento || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="desconto">Desconto (R$)</Label>
          <Input
            id="desconto"
            value={formatCurrencyDisplay(localCondominiumData.desconto)}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
          <Input
            id="valorMensal"
            value={formatCurrencyDisplay(localCondominiumData.valormensal)}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tipoDocumento">Nota Fiscal / Recibo</Label>
          <Select 
            value={isCnpjEmpty ? 'recibo' : (localCondominiumData.tipodocumento || '')}
            onValueChange={handleTipoDocumentoChange}
            disabled={isCnpjEmpty}
          >
            <SelectTrigger id="tipoDocumento">
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
            <div className="mt-1">
              <p className="text-xs text-muted-foreground">
                CNPJ não informado. Apenas Recibo disponível.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Para alterar este campo é necessário ter um CNPJ cadastrado. 
                Entre em contato com o administrador através do{" "}
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-xs text-brand-600 font-medium" 
                  onClick={navigateToContactPage}
                >
                  Fale Conosco
                </Button>.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <PlanUpgradeDialog 
          condominiumData={localCondominiumData}
          userMatricula={user.matricula}
          userEmail={user.email}
          onPlanUpgrade={handlePlanUpgrade}
          formatCurrencyDisplay={formatCurrencyDisplay}
        />
      </div>
    </Card>
  );
};
