
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Label } from './label';

interface Condominium {
  matricula: string;
  nomeCondominio: string;
}

interface SwitchCondominiumProps {
  condominiums: Condominium[];
  selectedCondominium: string;
  switchCondominium: (matricula: string) => void;
}

export function SwitchCondominium({ 
  condominiums, 
  selectedCondominium, 
  switchCondominium 
}: SwitchCondominiumProps) {
  
  const handleCondominiumChange = (value: string) => {
    switchCondominium(value);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Label htmlFor="condominium" className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
        Selecione o condomínio
      </Label>
      <Select
        value={selectedCondominium}
        onValueChange={handleCondominiumChange}
      >
        <SelectTrigger id="condominium" className="w-full">
          <SelectValue placeholder="Selecione um condomínio" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {condominiums.map((condo) => (
              <SelectItem key={condo.matricula} value={condo.matricula}>
                {condo.nomeCondominio}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
