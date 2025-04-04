
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, Mail, User, Building, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface AccountInfoSectionProps {
  condominiumData: any;
  userMatricula: string;
}

export const AccountInfoSection: React.FC<AccountInfoSectionProps> = ({ condominiumData, userMatricula }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const navigateToContactPage = () => {
    navigate('/contato');
  };
  
  const fieldLabelClasses = isMobile ? "flex items-center mb-1 text-sm font-medium" : "";
  const fieldIconClasses = "h-4 w-4 mr-2 text-brand-600";

  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md h-full">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center text-lg">
          <Building2 className="h-5 w-5 mr-2 text-brand-600" />
          Informações da Conta
        </CardTitle>
        <CardDescription>
          Detalhes de registro do condomínio
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="space-y-2">
          <Label htmlFor="matricula" className={fieldLabelClasses}>
            {isMobile && <User className={fieldIconClasses} />}
            Matrícula
          </Label>
          <Input
            id="matricula"
            value={userMatricula || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nome" className={fieldLabelClasses}>
            {isMobile && <Building className={fieldIconClasses} />}
            Nome do Condomínio
          </Label>
          <Input
            id="nome"
            value={condominiumData.nome || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cnpj" className={fieldLabelClasses}>
            {isMobile && <Briefcase className={fieldIconClasses} />}
            CNPJ
          </Label>
          <Input
            id="cnpj"
            value={condominiumData.cnpj || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className={fieldLabelClasses}>
            {isMobile && <Mail className={fieldIconClasses} />}
            E-mail de Contato
          </Label>
          <Input
            id="email"
            value={condominiumData.email || ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={navigateToContactPage}
          >
            <Mail className="mr-2 h-4 w-4" /> 
            Solicitar Alteração de Dados
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
