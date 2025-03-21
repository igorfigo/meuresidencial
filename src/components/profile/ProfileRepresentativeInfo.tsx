
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProfileRepresentativeInfoProps {
  condominiumData: any;
}

export const ProfileRepresentativeInfo = ({ condominiumData }: ProfileRepresentativeInfoProps) => {
  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Informações Representante Legal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nomeLegal">Nome Completo</Label>
          <Input
            id="nomeLegal"
            value={condominiumData.nomelegal || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailLegal">E-mail</Label>
          <Input
            id="emailLegal"
            value={condominiumData.emaillegal || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefoneLegal">Número de Telefone</Label>
          <Input
            id="telefoneLegal"
            value={condominiumData.telefonelegal || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="enderecoLegal">Endereço Residencial</Label>
          <Input
            id="enderecoLegal"
            value={condominiumData.enderecolegal || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
      </div>
    </Card>
  );
};
