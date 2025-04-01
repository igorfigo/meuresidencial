
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { FormFields } from '@/hooks/use-condominium-form';

interface SegurancaProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isExistingRecord: boolean;
}

export const Seguranca = ({ handleInputChange, isExistingRecord }: SegurancaProps) => {
  const { register, watch, setValue } = useFormContext<FormFields>();
  const ativo = watch('ativo');
  
  return (
    <Card className="form-section p-6 border-t-4 border-t-brand-600 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Informações de Segurança</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            {...register('senha')}
            placeholder="Senha"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
          <Input
            id="confirmarSenha"
            type="password"
            {...register('confirmarSenha')}
            placeholder="Confirmar Senha"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ativo">Ativo</Label>
          <Switch 
            id="ativo" 
            checked={ativo} 
            onCheckedChange={(checked) => {
              setValue('ativo', checked);
              if (handleInputChange) {
                const newEvent = { target: { checked: checked, name: 'ativo' } } as any;
                handleInputChange(newEvent as React.ChangeEvent<HTMLInputElement>);
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
};
