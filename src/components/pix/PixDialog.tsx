
import React, { useState, useEffect } from 'react';
import { Copy, QrCode, AlertCircle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generatePixCode, generatePixQRCode } from '@/utils/pixGenerator';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

interface PixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pixData: {
    keyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE';
    pixKey: string;
    amount: number;
    condominiumName: string;
    matricula: string;
    unit?: string;
  };
  month: string;
  year: string;
  isOverdue?: boolean;
  dueDate?: string;
  interestRate?: string;
  isHistorical?: boolean;
}

export const PixDialog = ({ 
  isOpen, 
  onClose, 
  pixData, 
  month, 
  year, 
  isOverdue = false,
  dueDate = '',
  interestRate = '0.033',
  isHistorical = false
}: PixDialogProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate interest if payment is overdue
  const calculateTotalWithInterest = () => {
    if (!isOverdue || !dueDate) return pixData.amount;
    
    const dueDateTime = new Date(dueDate);
    const today = new Date();
    
    // Calculate days of delay (minimum 1)
    const daysDelayed = Math.max(1, Math.floor((today.getTime() - dueDateTime.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Convert interest rate string to number (e.g., "0.033" to 0.033)
    const dailyInterestRate = parseFloat(interestRate) / 100;
    
    // Calculate interest amount
    const interestAmount = pixData.amount * dailyInterestRate * daysDelayed;
    
    // Return total with interest
    return pixData.amount + interestAmount;
  };
  
  const totalAmount = calculateTotalWithInterest();
  const interestAmount = totalAmount - pixData.amount;
  
  // Generate PIX code with the total amount (including interest if applicable)
  const pixCodeData = {
    ...pixData,
    amount: totalAmount,
    isHistorical
  };
  
  const pixCode = generatePixCode(pixCodeData);
  
  // Generate QR code on component mount
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      console.log('Generating QR code for PIX code:', pixCode);
      generatePixQRCode(pixCode).then(url => {
        console.log('QR code URL generated:', url);
        setQrCodeUrl(url);
        setIsLoading(false);
      }).catch(error => {
        console.error('Error generating QR code:', error);
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold text-blue-600">
            {isHistorical ? 'Pagamento para Dados Históricos' : 'Pagar via PIX'}
          </DialogTitle>
          <DialogDescription className="mt-1">
            <div className="flex flex-col">
              {!isHistorical && (
                <span className="text-gray-700">Competência: {monthName} de {year}</span>
              )}
              <span className="text-gray-700">
                Valor: <span className="text-blue-600 font-semibold">
                  {formatCurrency(totalAmount)}
                </span>
              </span>
              
              {isHistorical && (
                <div className="mt-2 text-xs bg-blue-50 border border-blue-200 rounded-md p-2">
                  <div className="flex items-center mb-1 text-blue-700">
                    <Info className="h-4 w-4 mr-1" />
                    <span className="font-medium">Serviço de Dados Históricos</span>
                  </div>
                  <p className="text-blue-700">
                    Pagamento único para inclusão ou download dos dados históricos do condomínio no sistema.
                  </p>
                </div>
              )}
              
              {isOverdue && interestAmount > 0 && !isHistorical && (
                <div className="mt-2 text-xs bg-amber-50 border border-amber-200 rounded-md p-2">
                  <div className="flex items-center mb-1 text-amber-700">
                    <Info className="h-4 w-4 mr-1" />
                    <span className="font-medium">Pagamento em atraso</span>
                  </div>
                  <p className="text-amber-700">
                    Valor original: {formatCurrency(pixData.amount)}<br />
                    Juros calculados: {formatCurrency(interestAmount)} 
                    <span className="text-xs ml-1">({interestRate}% ao dia)</span>
                  </p>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="pt-4 space-y-4">
          {/* QR Code Section */}
          <div className="flex flex-col space-y-3 items-center">
            <div className="flex items-center gap-2 font-medium text-gray-800">
              <QrCode className="h-5 w-5 text-blue-600" />
              <h3>QR Code</h3>
            </div>
            
            <div className="bg-white border border-gray-200 p-4 rounded-md w-full flex justify-center items-center h-64">
              {isLoading ? (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              ) : qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code PIX" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center text-gray-500">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                  <p>Não foi possível gerar o QR Code.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Copy Code Button */}
          <div className="flex flex-col mt-6">
            <Button 
              onClick={handleCopyClick} 
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar código PIX
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
