
import React, { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import { Check, Copy, QrCode, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/currency';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixCode: string;
  amount: number;
  month: string;
  year: string;
  receiverName: string;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  isOpen,
  onClose,
  pixCode,
  amount,
  month,
  year,
  receiverName,
}) => {
  const [copied, setCopied] = useState(false);
  const pixCodeRef = useRef<HTMLDivElement>(null);
  
  const handleCopy = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthIndex = parseInt(month) - 1;
  const formattedMonth = monthNames[monthIndex];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Pagamento via PIX</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="text-center mb-2">
            <p className="font-medium">Competência: {formattedMonth} de {year}</p>
            <p className="text-2xl font-bold text-brand-600 my-2">{formatCurrency(amount)}</p>
            <p className="text-sm text-muted-foreground">Pagamento para: {receiverName}</p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <QRCode 
              value={pixCode}
              size={200}
              level="H"
              includeMargin={true}
              className="mx-auto"
            />
          </div>
          
          <div className="w-full">
            <div className="text-sm mb-1 text-muted-foreground">
              Copie o código PIX abaixo:
            </div>
            <div className="flex items-center">
              <div
                ref={pixCodeRef}
                className="bg-gray-100 p-3 rounded-l text-xs sm:text-sm font-mono break-all overflow-x-auto flex-1"
              >
                {pixCode}
              </div>
              <Button 
                variant="outline" 
                className="rounded-l-none" 
                onClick={handleCopy}
                title="Copiar código PIX"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center mt-4">
            Escaneie o QR Code ou cole o código acima no seu aplicativo do banco para realizar o pagamento.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
