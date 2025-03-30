
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Copy, CopyCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  dueDate: string;
  pixKey: string;
  pixKeyType: string;
  daysDue: number;
  interestRate: string;
}

export function PixPaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  dueDate, 
  pixKey, 
  pixKeyType, 
  daysDue, 
  interestRate 
}: PixPaymentModalProps) {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<string>('code');
  const [pixCode, setPixCode] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [finalAmount, setFinalAmount] = useState<string>(amount);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Obtém o nome do condomínio e a cidade do usuário logado
  const merchantName = user?.nomeCondominio || "Condomínio";
  const merchantCity = user?.cidade || "SÃO PAULO";
  
  useEffect(() => {
    if (isOpen) {
      // Calcular o valor final com juros se estiver vencido
      const calculatedAmount = calculateAmountWithInterest(amount, daysDue, interestRate);
      setFinalAmount(calculatedAmount);
      
      // Gerar o código PIX e QR Code
      const pixData = generatePixData(pixKey, pixKeyType, calculatedAmount, merchantName, merchantCity);
      setPixCode(pixData.code);
      setQrCodeUrl(`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(pixData.code)}&choe=UTF-8`);
      setIsLoading(false);
    } else {
      setIsCopied(false);
      setIsLoading(true);
    }
  }, [isOpen, amount, daysDue, interestRate, pixKey, pixKeyType, merchantName, merchantCity]);

  const calculateAmountWithInterest = (
    baseAmount: string, 
    days: number, 
    rate: string
  ): string => {
    if (days <= 0) return baseAmount;
    
    // Convertendo para número
    const amountValue = parseFloat(baseAmount.replace(/[^\d,]/g, '').replace(',', '.'));
    const dailyRate = parseFloat(rate.replace(',', '.')) / 100;
    
    // Calculando juros
    const totalAmount = amountValue * (1 + (dailyRate * days));
    
    // Formatando de volta para string
    return totalAmount.toFixed(2).replace('.', ',');
  };

  const generatePixData = (
    key: string, 
    keyType: string, 
    value: string,
    merchantName: string,
    merchantCity: string
  ) => {
    // Implementação baseada no Manual de Padrões para Iniciação do Pix do BCB
    // https://www.bcb.gov.br/estabilidadefinanceira/pix
    
    const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    
    // Normalizando o nome do comerciante (removendo acentos e limitando tamanho)
    const normalizedMerchantName = merchantName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .substring(0, 25);
    
    // Normalizando a cidade (removendo acentos e limitando tamanho)
    const normalizedMerchantCity = merchantCity
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .substring(0, 15);
    
    // ID da transação (opcional)
    const txid = Math.random().toString(36).substring(2, 15);
    
    // Montando os campos do PIX conforme padrão EMV
    const payload = {
      '00': '01', // Payload Format Indicator
      '01': '11', // Códigos iniciação BR
      '26': { // Merchant Account Information
        '00': 'br.gov.bcb.pix', // GUI
        '01': key // Chave PIX
      },
      '52': '0000', // Merchant Category Code (MCC)
      '53': '986', // Transaction Currency (BRL)
      '54': numericValue, // Transaction Amount
      '58': normalizedMerchantCity, // Merchant City
      '59': normalizedMerchantName, // Merchant Name
      '60': 'BRASIL', // Country Code
      '62': { // Additional Data Field
        '05': txid // Reference Label
      }
    };

    // Esta é uma versão simplificada. Na prática, precisaria seguir o padrão EMV
    // completamente, incluindo o cálculo de CRC e formatação correta.
    const pixCode = `00020126330014br.gov.bcb.pix0111${key}52040000530398654${numericValue.padStart(12, '0')}5802BR5903${normalizedMerchantName}6007${normalizedMerchantCity}62070503${txid}6304`;
    
    return {
      code: pixCode,
      txid: txid
    };
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixCode).then(() => {
      setIsCopied(true);
      toast.success('Código PIX copiado para a área de transferência!');
      
      // Reset copied state after 3 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento via PIX</DialogTitle>
          <DialogDescription>
            Utilize as opções abaixo para realizar o pagamento
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded-md mb-4 text-sm">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Informações de pagamento:</p>
                  <p>Valor original: R$ {amount}</p>
                  {daysDue > 0 && (
                    <p>Valor com juros ({daysDue} dias, {interestRate}% ao dia): R$ {finalAmount}</p>
                  )}
                  <p>Tipo de chave: {pixKeyType.toUpperCase()}</p>
                  <p>Vencimento: {dueDate}</p>
                  <p>Recebedor: {merchantName}</p>
                  <p>Cidade: {merchantCity}</p>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="code" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">Código PIX</TabsTrigger>
                <TabsTrigger value="qrcode">QR Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="flex flex-col items-center space-y-4 mt-4">
                <div className="p-4 bg-gray-100 w-full rounded-md break-all text-sm font-mono">
                  {pixCode}
                </div>
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isCopied ? (
                    <>
                      <CopyCheck className="h-4 w-4" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copiar código PIX
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="qrcode" className="flex flex-col items-center space-y-4 mt-4">
                <div className="bg-white p-2 rounded-md shadow-sm">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code PIX" 
                    className="w-64 h-64" 
                  />
                </div>
                <p className="text-sm text-center text-gray-600">
                  Escaneie este QR Code com o app do seu banco para pagar
                </p>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
