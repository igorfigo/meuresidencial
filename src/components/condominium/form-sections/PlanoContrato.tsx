
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
  
  // Watch for changes to planoContratado, desconto, and cnpj
  const planoContratado = watch('planoContratado');
  const desconto = watch('desconto');
  const valorPlano = watch('valorPlano');
  const cnpj = watch('cnpj');

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
    const valorMensal = `R$ ${formatToBRL(Math.max(0, planoNumber - descontoNumber))}`;
    
    setValue('valorMensal', valorMensal);
  }, [valorPlano, desconto, setValue]);

  // Effect to ensure tipoDocumento is 'recibo' when CNPJ is empty
  React.useEffect(() => {
    if (!cnpj || cnpj.trim() === '') {
      setValue('tipoDocumento', 'recibo');
    }
  }, [cnpj, setValue]);

  const handlePlanoChange = (value: string) => {
    setValue('planoContratado', value);
    const planValue = getPlanValue(value);
    setValue('valorPlano', planValue);
  };

  const handleDescontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the raw value
    const value = e.target.value.replace(/\D/g, '');
    
    // Format to currency with R$ prefix and proper Brazilian format (comma as decimal separator)
    const formattedValue = value ? `R$ ${formatToBRL(Number(value) / 100)}` : 'R$ 0,00';
    
    setValue('desconto', formattedValue);
    
    // Apply the general input change handler for other effects
    if (handleInputChange) {
      handleInputChange(e);
    }
  };

  // Set default value for vencimento to "10" and formaPagamento to "pix"
  React.useEffect(() => {
    setValue('vencimento', '10');
    setValue('formaPagamento', 'pix');
  }, [setValue]);

  // Check if CNPJ is empty to determine if tipoDocumento Select should be disabled
  const isCnpjEmpty = !cnpj || cnpj.trim() === '';

  const handleJurosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^\d.,]/g, '');
    // Replace comma with dot for decimal handling
    const normalizedValue = value.replace(/,/g, '.');
    
    // Ensure only one decimal point
    const parts = normalizedValue.split('.');
    let formattedValue = parts[0] || '';
    
    if (parts.length > 1) {
      formattedValue += '.' + parts[1];
    }
    
    setValue('jurosaodia', formattedValue);
    
    // Apply the general input change handler for other effects
    if (handleInputChange) {
      handleInputChange(e);
    }
  };

  return (
    <Card className="form-section p-6 border-t-4 border-t-brand-600 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Plano / Contrato</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="planoContratado" className="flex items-center">
            Plano Contratado <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select 
            value={planoContratado}
            onValueChange={handlePlanoChange}
            disabled={isLoadingPlans}
            required
          >
            <SelectTrigger id="planoContratado" className={!planoContratado ? "border-red-300" : ""}>
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
          {!planoContratado && (
            <p className="text-xs text-red-500">
              Plano Contratado é obrigatório
            </p>
          )}
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
          <Input
            id="formaPagamento"
            value="PIX"
            readOnly
            className="bg-gray-100"
          />
          <input type="hidden" {...register('formaPagamento')} value="pix" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vencimento">Vencimento</Label>
          <Input
            id="vencimento"
            value="10"
            readOnly
            className="bg-gray-100"
          />
          <input type="hidden" {...register('vencimento')} value="10" />
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
          <Label htmlFor="jurosaodia">Juros ao Dia (%)</Label>
          <Input
            id="jurosaodia"
            {...register('jurosaodia')}
            onChange={handleJurosChange}
            placeholder="0.033"
            numberOnly
          />
          <p className="text-xs text-muted-foreground">
            Exemplo: 0.033 para uma taxa de 0,033% ao dia
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tipoDocumento">Nota Fiscal / Recibo</Label>
          <Select 
            value={watch('tipoDocumento')}
            onValueChange={(value) => setValue('tipoDocumento', value)}
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
            <p className="text-xs text-muted-foreground mt-1">
              CNPJ não informado. Apenas Recibo disponível.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
