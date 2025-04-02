
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, QrCode, Info } from 'lucide-react';
import { toast } from 'sonner';
import { generatePixCode, generatePixQRCode } from '@/utils/pixGenerator';
import { useApp } from '@/contexts/AppContext';

interface HistoricalDataPixSectionProps {
  amount?: number;
}

export const HistoricalDataPixSection = ({ amount = 249.00 }: HistoricalDataPixSectionProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pixCode, setPixCode] = useState<string>('');
  const { user } = useApp();
  
  // Get matricula to use in PIX generation
  const matricula = user?.matricula || '';

  const handleGeneratePix = async () => {
    try {
      setIsLoading(true);
      
      // First, get the PIX key information
      const response = await fetch('https://kcbvdcacgbwigefwacrk.supabase.co/rest/v1/pix_key_meuresidencial?select=*&limit=1', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjYnZkY2FjZ2J3aWdlZndhY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjgzMDQsImV4cCI6MjA1NzgwNDMwNH0.K4xcW6V3X9QROQLekB74NbKg3BaShwgMbanrP3olCYI',
          'Content-Type': 'application/json'
        }
      });
      
      const pixData = await response.json();
      
      if (!pixData || pixData.length === 0) {
        toast.error('Não foi possível obter a chave PIX');
        setIsLoading(false);
        return;
      }
      
      const pixKeyData = pixData[0];
      
      // Create the PIX data for generator with the updated parameters including matricula
      const pixGeneratorData = {
        keyType: pixKeyData.tipochave as 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE',
        pixKey: pixKeyData.chavepix,
        amount: amount,
        condominiumName: `HIST${amount.toFixed(2).replace('.', '')}`,
        matricula: matricula
      };
      
      // Generate the PIX code
      const code = generatePixCode(pixGeneratorData);
      setPixCode(code);
      
      // Generate QR code URL
      const qrUrl = await generatePixQRCode(code);
      setQrCodeUrl(qrUrl);
      
    } catch (error) {
      console.error('Error generating PIX:', error);
      toast.error('Falha ao gerar o código PIX');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyClick = () => {
    if (!pixCode) {
      toast.error('Gere o código PIX primeiro');
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

  return (
    <Card className="border-t-4 border-t-blue-600 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-blue-700">Pagamento PIX para Dados Históricos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Informação sobre o pagamento</p>
                <p>O valor fixo para solicitação de dados históricos é R$ 249,00.</p>
                <p>Gere o QR Code e efetue o pagamento para prosseguir com sua solicitação.</p>
              </div>
            </div>
          </div>

          {!qrCodeUrl && !isLoading && (
            <div className="flex justify-center mt-2">
              <Button 
                onClick={handleGeneratePix} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Gerar QR Code PIX
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          )}

          {qrCodeUrl && !isLoading && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="bg-white border border-gray-200 p-4 rounded-md flex justify-center items-center h-64 w-full max-w-xs mx-auto">
                  <img src={qrCodeUrl} alt="QR Code PIX" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-500 mb-2">Valor: <span className="font-medium text-gray-700">R$ {amount.toFixed(2)}</span></p>
                
                <Button 
                  onClick={handleCopyClick} 
                  variant="outline"
                  className="w-full max-w-xs mx-auto border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar código PIX
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
