
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { FormFields } from '@/hooks/use-condominium-form';

interface SegurancaProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isExistingRecord: boolean;
}

export const Seguranca = ({ handleInputChange, isExistingRecord }: SegurancaProps) => {
  const { register, getValues } = useFormContext<FormFields>();

  return (
    <Card className="form-section p-6 border-t-4 border-t-brand-600 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Segurança</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="senha">
            Senha {!isExistingRecord && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="senha"
            {...register('senha')}
            type="password"
            onChange={handleInputChange}
            placeholder={isExistingRecord ? "Digite para alterar a senha (opcional)" : "Digite uma senha segura"}
            required={!isExistingRecord}
          />
          {isExistingRecord && (
            <p className="text-xs text-muted-foreground">
              Preencha apenas se desejar alterar a senha.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmarSenha">
            Confirmar Senha {!isExistingRecord && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="confirmarSenha"
            {...register('confirmarSenha')}
            type="password"
            onChange={handleInputChange}
            placeholder={isExistingRecord ? "Confirme a nova senha (opcional)" : "Confirme sua senha"}
            required={!isExistingRecord}
          />
        </div>
      </div>
    </Card>
  );
};
