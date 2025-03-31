
import React, { useState } from 'react';
import { Copy, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState('copy');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  const pixCode = generatePixCode(pixData);
  
  const handleCopyClick = () => {
    navigator.clipboard.writeText(pixCode)
      .then(() => {
        toast.success('Código PIX copiado para a área de transferência');
      })
      .catch(() => {
        toast.error('Falha ao copiar. Tente copiar manualmente.');
      });
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === 'qrcode' && !qrCodeUrl) {
      generatePixQRCode(pixCode).then(url => {
        setQrCodeUrl(url);
      });
    }
  };
  
  // Get month name
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const monthName = monthNames[parseInt(month) - 1];
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagar via PIX</DialogTitle>
          <DialogDescription>
            Competência: {monthName} de {year}
            <br />
            Valor: R$ {pixData.amount.toFixed(2).replace('.', ',')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="copy">Copiar e Colar</TabsTrigger>
              <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="copy" className="p-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full p-3 bg-gray-100 rounded-md overflow-x-auto text-xs font-mono">
                  {pixCode}
                </div>
                
                <Button 
                  onClick={handleCopyClick} 
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar código PIX
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  Copie o código acima e cole no aplicativo do seu banco para realizar o pagamento.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="qrcode" className="flex flex-col items-center p-4 space-y-4">
              {qrCodeUrl ? (
                <div className="flex flex-col items-center space-y-4 w-full">
                  <div className="border border-gray-200 p-2 rounded-md max-w-full">
                    <img src={qrCodeUrl} alt="QR Code PIX" className="w-64 h-64 max-w-full object-contain" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Escaneie o QR Code acima com o aplicativo do seu banco para realizar o pagamento.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 w-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
