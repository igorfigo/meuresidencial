
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProfileCondominiumInfoProps {
  condominiumData: any;
}

export const ProfileCondominiumInfo = ({ condominiumData }: ProfileCondominiumInfoProps) => {
  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Informações Condomínio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="matricula">Matrícula</Label>
          <Input
            id="matricula"
            value={condominiumData.matricula || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={condominiumData.cnpj || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nomeCondominio">Nome do Condomínio</Label>
          <Input
            id="nomeCondominio"
            value={condominiumData.nomecondominio || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={condominiumData.cep || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rua">Rua</Label>
          <Input
            id="rua"
            value={condominiumData.rua || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input
            id="numero"
            value={condominiumData.numero || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            value={condominiumData.complemento || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            value={condominiumData.bairro || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={condominiumData.cidade || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Input
            id="estado"
            value={condominiumData.estado || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
      </div>
    </Card>
  );
};
