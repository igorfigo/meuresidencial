
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, History, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { HistoricalDataPixSection } from '@/components/pix/HistoricalDataPixSection';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const DadosHistoricos = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [requestType, setRequestType] = useState<'download' | 'inclusion'>('download');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is a manager (not admin and not resident)
  if (user?.isAdmin || user?.isResident) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Dados Históricos</h1>
          <Separator className="mb-4" />
          <Card className="border-t-4 border-t-amber-500 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <History className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg mb-2">Acesso Restrito</h3>
                  <p className="text-gray-600">
                    Esta funcionalidade está disponível apenas para gestores de condomínio.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  const handleSubmitRequest = async () => {
    if (!user?.matricula) {
      toast.error('Erro: Matrícula não encontrada');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the request data object
      const requestData = {
        matricula: user.matricula,
        request_type: requestType,
        status: 'pending'
      };
      
      // Make the request with explicit type casting to avoid TypeScript errors
      const { error } = await supabase
        .from('historical_data_requests')
        .insert([requestData]);
      
      if (error) {
        console.error('Error submitting request:', error);
        
        // Provide more specific error messages based on the error type
        if (error.code === '42501') {
          toast.error('Sem permissão para enviar solicitação. Entre em contato com o suporte.');
        } else {
          toast.error(`Erro ao enviar solicitação: ${error.message}`);
        }
        return;
      }
      
      toast.success('Solicitação enviada com sucesso!');
    } catch (error) {
      console.error('Error in request submission:', error);
      toast.error('Erro ao enviar solicitação. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Dados Históricos</h1>
        <Separator className="mb-2" />
        <p className="text-gray-600 mb-6">
          Solicite a inclusão ou download de dados históricos para o seu condomínio.
        </p>
        
        {/* PIX Payment Section */}
        {user?.matricula && <HistoricalDataPixSection matricula={user.matricula} />}
        
        {/* Request Form for Managers */}
        <Card className="border-t-4 border-t-green-500 shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Solicitar Dados Históricos</CardTitle>
            <CardDescription>
              Selecione o tipo de solicitação que deseja realizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={requestType} 
              onValueChange={(value) => setRequestType(value as 'download' | 'inclusion')}
              className="space-y-4"
            >
              <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md hover:bg-gray-50">
                <RadioGroupItem value="download" id="option-download" />
                <div className="space-y-1">
                  <Label htmlFor="option-download" className="font-medium flex items-center">
                    <History className="mr-2 h-4 w-4 text-blue-500" />
                    Download de dados
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receba um arquivo com os dados históricos existentes do seu condomínio.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md hover:bg-gray-50">
                <RadioGroupItem value="inclusion" id="option-inclusion" />
                <div className="space-y-1">
                  <Label htmlFor="option-inclusion" className="font-medium flex items-center">
                    <History className="mr-2 h-4 w-4 text-green-500" />
                    Inclusão de dados
                  </Label>
                  <p className="text-sm text-gray-500">
                    Inclua dados históricos anteriores à utilização do sistema.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-end border-t bg-gray-50 rounded-b-lg">
            <Button 
              onClick={handleSubmitRequest} 
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar solicitação
            </Button>
          </CardFooter>
        </Card>
        
        {/* Information Card */}
        <Card className="border shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Info className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-lg mb-2">Como proceder após a solicitação</h3>
                <p className="text-gray-600 mb-2">
                  Após realizar o pagamento e enviar a solicitação, nossa equipe entrará em contato no prazo de até 24 horas úteis para informar os próximos passos.
                </p>
                <p className="text-gray-600">
                  Você receberá orientações por e-mail sobre como fornecer ou receber os dados históricos, de acordo com o tipo de solicitação.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-end gap-4'} pt-2 border-t border-gray-100 bg-gray-50 rounded-b-lg`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className={`${isMobile ? 'w-full' : ''} border-gray-300 hover:bg-gray-100 hover:text-gray-700`}
            >
              Voltar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DadosHistoricos;
