
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
  const { register, setValue } = useFormContext<FormFields>();

  // Handle phone input to only allow numbers and limit to 11 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Remove non-numeric characters and limit to 11 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 11);
    
    setValue('telefoneLegal', numericValue);
    
    if (handleInputChange) {
      const newEvent = { ...e, target: { ...e.target, value: numericValue, name: 'telefoneLegal' } };
      handleInputChange(newEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <Card className="form-section p-6 border-t-4 border-t-brand-600 shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4">Informações Representante Legal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nomeLegal">Nome Completo</Label>
          <Input
            id="nomeLegal"
            {...register('nomeLegal')}
            onChange={handleInputChange}
            placeholder="Nome do Representante Legal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailLegal">Email</Label>
          <Input
            id="emailLegal"
            type="email"
            {...register('emailLegal')}
            onChange={handleInputChange}
            placeholder="email@exemplo.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefoneLegal">Número de Telefone</Label>
          <Input
            id="telefoneLegal"
            {...register('telefoneLegal')}
            onChange={handlePhoneChange}
            placeholder="Somente números"
            numberOnly
            maxLength={11}
          />
          <p className="text-xs text-muted-foreground">
            Digite apenas números (máximo 11 dígitos)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="enderecoLegal">Endereço</Label>
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
