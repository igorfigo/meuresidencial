
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { AccountingReport } from '@/components/financials/AccountingReport';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FinanceiroPrestacaoContas = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<boolean>(true);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-2 sm:px-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/financeiro')}
            className="mb-3 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        )}
        
        <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-start mb-4`}>
          <div className={isMobile ? 'w-full' : ''}>
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold mb-1`}>Prestação de Contas</h1>
            <Separator className="mb-2" />
            <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>
              Relatório mensal de receitas e despesas do condomínio por data de pagamento
            </p>
          </div>
        </div>
        
        {isMobile && (
          <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800">
            <AlertDescription className="text-xs">
              Utilize o relatório abaixo para verificar todas as receitas e despesas do período. Você pode alternar entre os meses para analisar diferentes períodos.
            </AlertDescription>
          </Alert>
        )}
        
        {isMobile ? (
          <Accordion type="single" collapsible defaultValue="report" className="w-full">
            <AccordionItem value="report" className="border-none">
              <AccordionContent className="pt-0">
                <AccountingReport />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <AccountingReport />
        )}
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroPrestacaoContas;
