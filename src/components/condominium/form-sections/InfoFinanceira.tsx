
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FormFields } from '@/hooks/use-condominium-form';

interface InfoFinanceiraProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const bancos = [
  "Itaú Unibanco",
  "Banco do Brasil",
  "Bradesco",
  "Caixa Econômica Federal",
  "Santander Brasil",
  "BTG Pactual",
  "Banco Safra",
  "Sicredi",
  "Sicoob",
  "Citibank"
];

export const InfoFinanceira = ({ handleInputChange }: InfoFinanceiraProps) => {
  const { register, setValue, watch } = useFormContext<FormFields>();

  return (
    <Card className="form-section p-6">
      <h2 className="text-xl font-semibold mb-4">Informações Financeiras</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="banco">Banco</Label>
          <Select 
            value={watch('banco')}
            onValueChange={(value) => setValue('banco', value)}
          >
            <SelectTrigger id="banco">
              <SelectValue placeholder="Selecione o banco" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {bancos.map((banco) => (
                  <SelectItem key={banco} value={banco}>
                    {banco}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="agencia">Agência</Label>
          <Input
            id="agencia"
            {...register('agencia')}
            onChange={handleInputChange}
            placeholder="Número da Agência (Somente Números)"
            numberOnly
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="conta">Conta</Label>
          <Input
            id="conta"
            {...register('conta')}
            onChange={handleInputChange}
            placeholder="Número da Conta (Somente Números)"
            numberOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pix">PIX</Label>
          <Input
            id="pix"
            {...register('pix')}
            onChange={handleInputChange}
            placeholder="Chave PIX (Somente Números)"
            numberOnly
          />
        </div>
      </div>
    </Card>
  );
};
