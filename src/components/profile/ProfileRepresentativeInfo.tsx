
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserCog, Mail, Phone, MapPin, User } from 'lucide-react';
import { ChangeManagerDialog } from './ChangeManagerDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileRepresentativeInfoProps {
  condominiumData: any;
}

export const ProfileRepresentativeInfo = ({ condominiumData }: ProfileRepresentativeInfoProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <Card className="border-t-4 border-t-brand-600 shadow-md p-4 md:p-6 w-full">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-semibold">Representante Legal</h2>
          </div>
          
          {!isMobile && (
            <Button 
              onClick={() => setDialogOpen(true)}
              variant="outline" 
              className="flex items-center gap-2 border-brand-200 hover:bg-brand-50 hover:border-brand-300 transition-all"
            >
              <UserCog className="h-4 w-4 text-brand-600" />
              <span>Alterar Gestor</span>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="space-y-2 w-full">
            <Label htmlFor="nomeLegal" className="flex items-center gap-1">
              <User className="h-4 w-4 text-gray-500" />
              Nome Completo
            </Label>
            <Input
              id="nomeLegal"
              value={condominiumData.nomelegal || ''}
              readOnly
              className="bg-gray-50 font-medium w-full"
            />
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="emailLegal" className="flex items-center gap-1">
              <Mail className="h-4 w-4 text-gray-500" />
              E-mail
            </Label>
            <Input
              id="emailLegal"
              value={condominiumData.emaillegal || ''}
              readOnly
              className="bg-gray-50 font-medium w-full"
            />
          </div>
          
          <div className="space-y-2 w-full">
            <Label htmlFor="telefoneLegal" className="flex items-center gap-1">
              <Phone className="h-4 w-4 text-gray-500" />
              Número de Telefone
            </Label>
            <Input
              id="telefoneLegal"
              value={condominiumData.telefonelegal || ''}
              readOnly
              className="bg-gray-50 font-medium w-full"
            />
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="enderecoLegal" className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              Endereço Residencial
            </Label>
            <Input
              id="enderecoLegal"
              value={condominiumData.enderecolegal || ''}
              readOnly
              className="bg-gray-50 font-medium w-full"
            />
          </div>
        </div>

        {isMobile && (
          <div className="mt-6 w-full">
            <Button 
              onClick={() => setDialogOpen(true)}
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 border-brand-200 hover:bg-brand-50 hover:border-brand-300 transition-all"
            >
              <UserCog className="h-4 w-4 text-brand-600" />
              <span>Alterar Gestor</span>
            </Button>
          </div>
        )}
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
