
import React, { useState, useEffect } from 'react';
import { Copy, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generatePixCode, generatePixQRCode } from '@/utils/pixGenerator';
import { toast } from 'sonner';

interface PixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pixData: {
    keyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE';
    pixKey: string;
    amount: number;
    condominiumName: string;
  };
  month: string;
  year: string;
}

export const PixDialog = ({ isOpen, onClose, pixData, month, year }: PixDialogProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const pixCode = generatePixCode(pixData);
  
  // Generate QR code on component mount
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      generatePixQRCode(pixCode).then(url => {
        setQrCodeUrl(url);
        setIsLoading(false);
      });
    }
  }, [isOpen, pixCode]);
  
  const handleCopyClick = () => {
    navigator.clipboard.writeText(pixCode)
      .then(() => {
        toast.success('Código PIX copiado para a área de transferência');
      })
      .catch(() => {
        toast.error('Falha ao copiar. Tente copiar manualmente.');
      });
  };
  
  // Get month name
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const monthName = monthNames[parseInt(month) - 1];
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold text-blue-600">Pagar via PIX</DialogTitle>
          <DialogDescription className="mt-1">
            <div className="flex flex-col">
              <span className="text-gray-700">Competência: {monthName} de {year}</span>
              <span className="text-gray-700">Valor: <span className="text-blue-600 font-semibold">R$ {pixData.amount.toFixed(2).replace('.', ',')}</span></span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="pt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Copy and Paste Section */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <Copy className="h-4 w-4 text-blue-600" />
                <h3>Copiar e Colar</h3>
              </div>
              
              <div className="w-full p-3 bg-white border border-gray-200 rounded-md overflow-x-auto text-xs font-mono h-28">
                {pixCode}
              </div>
              
              <Button 
                onClick={handleCopyClick} 
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar código PIX
              </Button>
              
              <div className="text-xs text-gray-600 text-center p-2 bg-blue-50 border border-blue-100 rounded-md">
                <p>Copie o código acima e cole no aplicativo do seu banco para realizar o pagamento.</p>
              </div>
            </div>
            
            {/* QR Code Section */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <QrCode className="h-4 w-4 text-blue-600" />
                <h3>QR Code</h3>
              </div>
              
              <div className="bg-white border border-gray-200 p-3 rounded-md w-full flex justify-center items-center h-28">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                ) : (
                  <img src={qrCodeUrl || ''} alt="QR Code PIX" className="h-full object-contain" />
                )}
              </div>
              
              <Button 
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => window.open(qrCodeUrl || '', '_blank')}
                disabled={!qrCodeUrl || isLoading}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Ampliar QR Code
              </Button>
              
              <div className="text-xs text-gray-600 text-center p-2 bg-blue-50 border border-blue-100 rounded-md">
                <p>Escaneie o QR Code acima com o aplicativo do seu banco para realizar o pagamento.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-center text-gray-500">
            <p>Caso tenha dificuldades, entre em contato com a administração do condomínio.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
