
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlans } from '@/hooks/use-plans';
import { BRLToNumber, formatToBRL } from '@/utils/currency';
import type { FormFields } from '@/hooks/use-condominium-form';

interface PlanoContratoProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PlanoContrato = ({ handleInputChange }: PlanoContratoProps) => {
  const { register, setValue, watch } = useFormContext<FormFields>();
  const { plans, isLoading: isLoadingPlans, getPlanValue } = usePlans();
  
  // Watch for changes to planoContratado and desconto
  const planoContratado = watch('planoContratado');
  const desconto = watch('desconto');
  const valorPlano = watch('valorPlano');

  // Effect to update valorPlano when planoContratado changes
  React.useEffect(() => {
    if (planoContratado) {
      const planValue = getPlanValue(planoContratado);
      setValue('valorPlano', planValue);
    }
  }, [planoContratado, getPlanValue, setValue]);

  // Effect to calculate valorMensal when valorPlano or desconto changes
  React.useEffect(() => {
    // Convert values to numbers for calculation
    const planoNumber = BRLToNumber(valorPlano);
    const descontoNumber = BRLToNumber(desconto);
    
    // Calculate total value ensuring it's not negative
    const valorMensal = formatToBRL(Math.max(0, planoNumber - descontoNumber));
    
    setValue('valorMensal', valorMensal);
  }, [valorPlano, desconto, setValue]);

  const handleDescontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the raw value
    const value = e.target.value.replace(/\D/g, '');
    
    // Format to currency with R$ prefix and proper Brazilian format (comma as decimal separator)
    const formattedValue = value ? formatToBRL(Number(value) / 100) : formatToBRL(0);
    
    setValue('desconto', formattedValue);
    
    // Apply the general input change handler for other effects
    if (handleInputChange) {
      handleInputChange(e);
    }
  };

  return (
    <Card className="form-section p-6">
      <h2 className="text-xl font-semibold mb-4">Plano / Contrato</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="planoContratado">Plano Contratado</Label>
          <Select 
            value={planoContratado}
            onValueChange={(value) => setValue('planoContratado', value)}
            disabled={isLoadingPlans}
          >
            <SelectTrigger id="planoContratado">
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
          <Label htmlFor="valorPlano">Valor do Plano (R$)</Label>
          <Input
            id="valorPlano"
            {...register('valorPlano')}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
          <Select 
            value={watch('formaPagamento')}
            onValueChange={(value) => setValue('formaPagamento', value)}
          >
            <SelectTrigger id="formaPagamento">
              <SelectValue placeholder="Forma de Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                <SelectItem value="transferencia">Transferência Bancária</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vencimento">Vencimento</Label>
          <Select 
            value={watch('vencimento')}
            onValueChange={(value) => setValue('vencimento', value)}
          >
            <SelectTrigger id="vencimento">
              <SelectValue placeholder="Vencimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {/* Only show options 5, 7, and 10 */}
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="desconto">Desconto (R$)</Label>
          <Input
            id="desconto"
            {...register('desconto')}
            onChange={handleDescontoChange}
            placeholder="R$ 0,00"
            isCurrency
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
          <Input
            id="valorMensal"
            {...register('valorMensal')}
            readOnly
            className="bg-gray-100"
          />
          <p className="text-xs text-muted-foreground">
            Valor do plano menos o desconto.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tipoDocumento">Nota Fiscal / Recibo</Label>
          <Select 
            value={watch('tipoDocumento')}
            onValueChange={(value) => setValue('tipoDocumento', value)}
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
  );
};
