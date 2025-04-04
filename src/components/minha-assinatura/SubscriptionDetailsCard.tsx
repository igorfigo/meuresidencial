
import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlanUpgradeDialog } from './PlanUpgradeDialog';
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, CreditCard, Receipt, Percent, DollarSign, HelpCircle } from 'lucide-react';

interface SubscriptionDetailsCardProps {
  condominiumData: any;
  user: { matricula: string; email: string };
  formatCurrencyDisplay: (value: string | null | undefined) => string;
  getCurrentPlanDetails: () => { name: string; value: string };
  pixDueDate?: string;
  onPlanUpdate?: (updatedData: any) => void;
  isMobile?: boolean;
}

export const SubscriptionDetailsCard = ({ 
  condominiumData, 
  user, 
  formatCurrencyDisplay,
  getCurrentPlanDetails,
  pixDueDate,
  onPlanUpdate,
  isMobile = false
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
      
      // If onPlanUpdate callback exists, call it to update parent component
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
    
    // If onPlanUpdate callback exists, call it to update parent component
    if (onPlanUpdate) {
      onPlanUpdate(updatedData);
    }
  };
  
  const navigateToContactPage = () => {
    navigate('/contato');
  };
  
  const planDetails = getCurrentPlanDetails();

  const dueDate = pixDueDate || localCondominiumData.vencimento || '';

  const fieldClasses = isMobile ? "space-y-2 w-full" : "";
  const fieldLabelClasses = isMobile ? "flex items-center mb-1 text-sm font-medium" : "";
  const fieldIconClasses = "h-4 w-4 mr-2 text-brand-600";

  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md p-4 md:p-6">
      <div className="flex items-center mb-4">
        <FileText className="h-5 w-5 mr-2 text-brand-600" />
        <h2 className="text-xl font-semibold">Plano / Contrato</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className={fieldClasses}>
          <Label htmlFor="planoContratado" className={fieldLabelClasses}>
            {isMobile && <CreditCard className={fieldIconClasses} />}
            Plano Contratado
          </Label>
          <Input
            id="planoContratado"
            value={planDetails.name}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className={fieldClasses}>
          <Label htmlFor="valorPlano" className={fieldLabelClasses}>
            {isMobile && <DollarSign className={fieldIconClasses} />}
            Valor do Plano (R$)
          </Label>
          <Input
            id="valorPlano"
            value={planDetails.value}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className={fieldClasses}>
          <Label htmlFor="formaPagamento" className={fieldLabelClasses}>
            {isMobile && <Receipt className={fieldIconClasses} />}
            Forma de Pagamento
          </Label>
          <Input
            id="formaPagamento"
            value={localCondominiumData.formapagamento || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className={fieldClasses}>
          <Label htmlFor="vencimento" className={fieldLabelClasses}>
            {isMobile && <Calendar className={fieldIconClasses} />}
            Vencimento
          </Label>
          <Input
            id="vencimento"
            value={dueDate}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className={fieldClasses}>
          <Label htmlFor="desconto" className={fieldLabelClasses}>
            {isMobile && <Percent className={fieldIconClasses} />}
            Desconto (R$)
          </Label>
          <Input
            id="desconto"
            value={formatCurrencyDisplay(localCondominiumData.desconto)}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className={fieldClasses}>
          <Label htmlFor="valorMensal" className={fieldLabelClasses}>
            {isMobile && <DollarSign className={fieldIconClasses} />}
            Valor Mensal (R$)
          </Label>
          <Input
            id="valorMensal"
            value={formatCurrencyDisplay(localCondominiumData.valormensal)}
            readOnly
            className="bg-gray-100 font-medium"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <Label htmlFor="tipoDocumento" className="flex items-center mb-1">
            <HelpCircle className="h-4 w-4 mr-2 text-brand-600" />
            Nota Fiscal / Recibo
          </Label>
          <Select 
            value={isCnpjEmpty ? 'recibo' : (localCondominiumData.tipodocumento || '')}
            onValueChange={handleTipoDocumentoChange}
            disabled={isCnpjEmpty || isLoading}
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
      
      <div className="mt-6 flex flex-wrap gap-3 justify-end">
        <PlanUpgradeDialog 
          condominiumData={localCondominiumData}
          userMatricula={user.matricula}
          userEmail={user.email}
          onPlanUpgrade={handlePlanUpgrade}
          formatCurrencyDisplay={formatCurrencyDisplay}
        />
        <CancelSubscriptionDialog 
          condominiumMatricula={user.matricula}
          userEmail={user.email}
        />
      </div>
    </Card>
  );
};
