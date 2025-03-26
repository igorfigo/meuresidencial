
import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Copy, Check, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface Charge {
  id: string;
  unit: string;
  reference_month: string;
  amount: string;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  payment_date: string | null;
  category: string;
  observations?: string;
}

interface PixSettings {
  tipochave: string;
  chavepix: string;
  diavencimento: string;
  jurosaodia: string;
}

interface QrCodeDisplayProps {
  charge: Charge;
  pixSettings: PixSettings;
  condominiumName: string;
}

export function QrCodeDisplay({ charge, pixSettings, condominiumName }: QrCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [pixCopiaECola, setPixCopiaECola] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>(charge.amount);
  const [calculatedInterest, setCalculatedInterest] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Calculate interest for overdue charges
    const calculateAmountWithInterest = () => {
      if (charge.status !== 'overdue') {
        setTotalAmount(charge.amount);
        return parseFloat(charge.amount);
      }

      const originalAmount = parseFloat(charge.amount);
      const dueDate = new Date(charge.due_date);
      const today = new Date();
      
      // Calculate days overdue
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Calculate interest
      const dailyInterestRate = parseFloat(pixSettings.jurosaodia) / 100;
      const interestAmount = originalAmount * dailyInterestRate * diffDays;
      
      // Total amount with interest
      const total = originalAmount + interestAmount;
      
      setCalculatedInterest(interestAmount);
      setTotalAmount(total.toFixed(2));
      return total;
    };

    const generateQrCode = async () => {
      setIsLoading(true);
      try {
        const finalAmount = calculateAmountWithInterest();
        
        // Generate QR code data
        const pixData = {
          keyType: pixSettings.tipochave,
          key: pixSettings.chavepix,
          amount: finalAmount,
          merchant: condominiumName,
          description: `Condomínio ${charge.unit} - ${formatMonthYear(charge.reference_month)}`,
          reference: charge.id
        };
        
        // Create "Copia e Cola" PIX string (this is a simplified implementation)
        // For a production app, you might want to use a library or API
        const pixString = `${pixSettings.tipochave}:${pixSettings.chavepix}?amount=${finalAmount}&description=${encodeURIComponent(pixData.description)}&reference=${charge.id}`;
        setPixCopiaECola(pixString);
        
        // Generate QR code URL using Google Charts API
        // For production, consider using a dedicated QR code library or API
        const qrCodeData = encodeURIComponent(pixString);
        const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${qrCodeData}`;
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
        toast.error('Erro ao gerar QR code');
      } finally {
        setIsLoading(false);
      }
    };

    generateQrCode();
  }, [charge, pixSettings, condominiumName]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopiaECola);
    setCopied(true);
    toast.success('Código PIX copiado!');
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  function formatMonthYear(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse bg-gray-200 w-[250px] h-[250px] rounded-lg"></div>
          <p>Gerando QR Code...</p>
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <img 
              src={qrCodeUrl} 
              alt="QR Code para pagamento" 
              className="w-[250px] h-[250px]" 
            />
          </div>
          
          <div className="text-center space-y-2 w-full">
            <div className="font-medium">Valor a pagar:</div>
            <div className="text-2xl font-bold text-brand-600">
              {formatCurrency(parseFloat(totalAmount))}
            </div>
            
            {calculatedInterest > 0 && (
              <div className="text-sm text-red-600">
                Inclui juros de {formatCurrency(calculatedInterest)} ({pixSettings.jurosaodia}% ao dia)
              </div>
            )}
            
            <div className="text-sm text-gray-600 mt-2">
              Pagamento para: {condominiumName}<br />
              Referente: {formatMonthYear(charge.reference_month)} - Unidade {charge.unit}
            </div>
          </div>
          
          <Button 
            onClick={handleCopyPix} 
            variant="outline" 
            className="w-full justify-between"
          >
            <span>Copiar código PIX</span>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
          
          <div className="text-sm text-gray-500 text-center">
            Use o QR code ou o código PIX para realizar o pagamento no app do seu banco
          </div>
        </>
      )}
    </div>
  );
}
