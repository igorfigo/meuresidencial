
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Home, MapPin, Building, Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ProfileCondominiumInfoProps {
  condominiumData: any;
}

export const ProfileCondominiumInfo = ({ condominiumData }: ProfileCondominiumInfoProps) => {
  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building className="h-5 w-5 text-brand-600" />
        <h2 className="text-xl font-semibold">Informações do Condomínio</h2>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="matricula" className="flex items-center gap-1">
              <Landmark className="h-4 w-4 text-gray-500" />
              Matrícula
            </Label>
            <Input
              id="matricula"
              value={condominiumData.matricula || ''}
              readOnly
              className="bg-gray-50 font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj" className="flex items-center gap-1">
              <Landmark className="h-4 w-4 text-gray-500" />
              CNPJ
            </Label>
            <Input
              id="cnpj"
              value={condominiumData.cnpj || ''}
              readOnly
              className="bg-gray-50 font-medium"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nomeCondominio" className="flex items-center gap-1">
              <Home className="h-4 w-4 text-gray-500" />
              Nome do Condomínio
            </Label>
            <Input
              id="nomeCondominio"
              value={condominiumData.nomecondominio || ''}
              readOnly
              className="bg-gray-50 font-medium"
            />
          </div>
        </div>
        
        <Accordion type="single" collapsible className="border rounded-md">
          <AccordionItem value="address">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span className="font-medium">Endereço do Condomínio</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={condominiumData.cep || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    value={condominiumData.rua || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={condominiumData.numero || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={condominiumData.complemento || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={condominiumData.bairro || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={condominiumData.cidade || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={condominiumData.estado || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  );
};
