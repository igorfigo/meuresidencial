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
  
  const planoContratado = watch('planoContratado');
  const desconto = watch('desconto');
  const valorPlano = watch('valorPlano');

  React.useEffect(() => {
    if (planoContratado) {
      const planValue = getPlanValue(planoContratado);
      setValue('valorPlano', planValue);
    }
  }, [planoContratado, getPlanValue, setValue]);

  React.useEffect(() => {
    const planoNumber = BRLToNumber(valorPlano);
    const descontoNumber = BRLToNumber(desconto);
    
    const valorMensal = `R$ ${formatToBRL(Math.max(0, planoNumber - descontoNumber))}`;
    
    setValue('valorMensal', valorMensal);
  }, [valorPlano, desconto, setValue]);

  const handlePlanoChange = (value: string) => {
    setValue('planoContratado', value);
    const planValue = getPlanValue(value);
    setValue('valorPlano', planValue);
  };

  const handleDescontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    const formattedValue = value ? `R$ ${formatToBRL(Number(value) / 100)}` : 'R$ 0,00';
    
    setValue('desconto', formattedValue);
    
    if (handleInputChange) {
      handleInputChange(e);
    }
  };

  React.useEffect(() => {
    setValue('vencimento', '10');
    setValue('formaPagamento', 'pix');
  }, [setValue]);

  return (
    <Card className="form-section p-6 border-t-4 border-t-brand-600 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Plano / Contrato</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="planoContratado">Plano Contratado</Label>
          <Select 
            value={planoContratado}
            onValueChange={handlePlanoChange}
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
