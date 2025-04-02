import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QrCode, Copy, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { generatePixCode, generatePixQRCode } from '@/utils/pixGenerator';
import { supabase } from '@/integrations/supabase/client';

interface HistoricalDataPixSectionProps {
  matricula: string;
}

export const HistoricalDataPixSection = ({ matricula }: HistoricalDataPixSectionProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pixCode, setPixCode] = useState<string>('');
  
  const { data: pixSettings } = useQuery({
    queryKey: ['pix-key', 'historical-data'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('pix_key_meuresidencial')
          .select('tipochave, chavepix')
          .single();
          
        if (error) {
          console.error('Error fetching PIX key:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error('Error in PIX key fetch:', err);
        return null;
      }
    }
  });
  
  useEffect(() => {
    if (pixSettings && matricula) {
      setIsLoading(true);
      
      try {
        let keyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE';
        switch(pixSettings.tipochave) {
          case 'CPF': keyType = 'CPF'; break;
          case 'CNPJ': keyType = 'CNPJ'; break;
          case 'EMAIL': keyType = 'EMAIL'; break; 
          case 'TELEFONE': keyType = 'TELEFONE'; break;
          default: keyType = 'CPF';
        }
        
        const code = generatePixCode({
          keyType,
          pixKey: pixSettings.chavepix,
          amount: 249.00,
          condominiumName: 'Dados Históricos',
          matricula,
          isHistorical: true
        });
        
        setPixCode(code);
        
        generatePixQRCode(code).then(url => {
          setQrCodeUrl(url);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error generating PIX code:', error);
        setIsLoading(false);
      }
    }
  }, [pixSettings, matricula]);
  
  const handleCopyClick = () => {
    if (!pixCode) {
      toast.error('Código PIX não disponível. Tente novamente mais tarde.');
      return;
    }
    
    navigator.clipboard.writeText(pixCode)
      .then(() => {
        toast.success('Código PIX copiado para a área de transferência');
      })
      .catch(() => {
        toast.error('Falha ao copiar. Tente copiar manualmente.');
      });
  };
  
  if (!pixSettings && !isLoading) {
    return (
      <Card className="border-t-4 border-t-amber-500 shadow-md mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-lg mb-2">Chave PIX não configurada</h3>
              <p className="text-gray-600 mb-2">
                Para disponibilizar pagamento via PIX, você precisa configurar uma chave PIX no sistema.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/cadastro-chave-pix">Configurar Chave PIX</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-t-4 border-t-blue-500 shadow-md mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <QrCode className="mr-2 h-5 w-5 text-blue-500" />
          Pagamento via PIX
        </CardTitle>
        <CardDescription>
          Utilize o QR code ou código de cópia e cola abaixo para realizar o pagamento da taxa de processamento.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-3">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-blue-700">Detalhes do Pagamento</h3>
              </div>
              <p className="text-sm text-blue-700">
                <strong>Valor:</strong> R$ 249,00<br />
                <strong>Descrição:</strong> Processamento de dados históricos
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 p-4 rounded-md flex justify-center items-center h-full">
              {isLoading ? (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              ) : qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code PIX" className="max-h-64 max-w-full object-contain" />
              ) : (
                <div className="text-center text-gray-500">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                  <p>Não foi possível gerar o QR Code.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={handleCopyClick} 
              variant="outline"
              className="w-full border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar código PIX
            </Button>
            
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mt-4">
              <p className="text-sm text-amber-700">
                <strong>Importante:</strong> Somente após o pagamento enviar sua solicitação de Dados Históricos.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
