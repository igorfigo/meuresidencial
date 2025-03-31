
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
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-brand-600">Pagar via PIX</DialogTitle>
          <DialogDescription className="mt-2">
            <div className="flex flex-col space-y-1">
              <span className="font-medium">Competência: <span className="font-normal">{monthName} de {year}</span></span>
              <span className="font-medium">Valor: <span className="font-normal text-brand-600 font-bold">R$ {pixData.amount.toFixed(2).replace('.', ',')}</span></span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="w-full pt-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="copy" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                <span>Copiar e Colar</span>
              </TabsTrigger>
              <TabsTrigger value="qrcode" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <span>QR Code</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="copy" className="p-4 border rounded-md bg-gray-50">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-full p-4 bg-white rounded-md overflow-x-auto text-xs font-mono border shadow-sm">
                  {pixCode}
                </div>
                
                <Button 
                  onClick={handleCopyClick} 
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar código PIX
                </Button>
                
                <div className="text-sm text-muted-foreground text-center p-3 bg-blue-50 border border-blue-100 rounded-md w-full">
                  <p>Copie o código acima e cole no aplicativo do seu banco para realizar o pagamento.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="qrcode" className="p-4 border rounded-md bg-gray-50">
              {qrCodeUrl ? (
                <div className="flex flex-col items-center space-y-6 w-full">
                  <div className="bg-white border p-4 rounded-md shadow-sm max-w-full flex justify-center">
                    <img src={qrCodeUrl} alt="QR Code PIX" className="w-64 h-64 max-w-full object-contain" />
                  </div>
                  
                  <div className="text-sm text-muted-foreground text-center p-3 bg-blue-50 border border-blue-100 rounded-md w-full">
                    <p>Escaneie o QR Code acima com o aplicativo do seu banco para realizar o pagamento.</p>
                  </div>
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
