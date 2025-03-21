
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { FormFields } from '@/hooks/use-condominium-form';

interface InfoRepresentanteProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InfoRepresentante = ({ handleInputChange }: InfoRepresentanteProps) => {
  const { register } = useFormContext<FormFields>();

  return (
    <Card className="form-section p-6">
      <h2 className="text-xl font-semibold mb-4">Informações Representante Legal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nomeLegal">Nome Completo</Label>
          <Input
            id="nomeLegal"
            {...register('nomeLegal')}
            onChange={handleInputChange}
            placeholder="Nome completo do representante"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailLegal">E-mail</Label>
          <Input
            id="emailLegal"
            {...register('emailLegal')}
            type="email"
            onChange={handleInputChange}
            placeholder="email@exemplo.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefoneLegal">Número de Telefone</Label>
          <Input
            id="telefoneLegal"
            {...register('telefoneLegal')}
            onChange={handleInputChange}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="enderecoLegal">Endereço Residencial</Label>
          <Input
            id="enderecoLegal"
            {...register('enderecoLegal')}
            onChange={handleInputChange}
            placeholder="Endereço completo"
          />
        </div>
      </div>
    </Card>
  );
};
