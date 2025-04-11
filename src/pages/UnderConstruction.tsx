
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Building, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UnderConstructionProps {
  pageTitle?: string;
}

const UnderConstruction = ({ pageTitle = "Página em Construção" }: UnderConstructionProps) => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
        <div className="relative mb-6">
          <Building className="h-16 w-16 text-brand-600" />
          <div className="absolute -top-2 -right-2 bg-brand-100 rounded-full p-1">
            <Wrench className="h-5 w-5 text-brand-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          Esta funcionalidade está sendo implementada e estará disponível em breve.
        </p>
        
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
          <Button
            className="bg-brand-600 hover:bg-brand-700"
            onClick={() => navigate('/dashboard')}
          >
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UnderConstruction;
