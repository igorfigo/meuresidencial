
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { ChangeManagerDialog } from './ChangeManagerDialog';

interface ProfileRepresentativeInfoProps {
  condominiumData: any;
}

export const ProfileRepresentativeInfo = ({ condominiumData }: ProfileRepresentativeInfoProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="border-t-4 border-t-brand-600 shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Informações Representante Legal</h2>
          <Button 
            onClick={() => setDialogOpen(true)}
            variant="outline" 
            className="flex items-center gap-2 hover:bg-brand-50"
          >
            <UserPlus className="h-4 w-4 text-brand-600" />
            Alterar Gestor
          </Button>
        </div>
        
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

      <ChangeManagerDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        matricula={condominiumData.matricula}
        currentName={condominiumData.nomelegal}
        currentEmail={condominiumData.emaillegal}
        currentPhone={condominiumData.telefonelegal}
        currentAddress={condominiumData.enderecolegal}
      />
    </>
  );
};
