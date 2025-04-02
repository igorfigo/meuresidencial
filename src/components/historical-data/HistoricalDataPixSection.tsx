
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { QrCode, Copy } from 'lucide-react';
import { PixDialog } from '@/components/pix/PixDialog';
import { toast } from 'sonner';

export const HistoricalDataPixSection = () => {
  const { user } = useApp();
  const [pixSettings, setPixSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const fixedAmount = 249.00; // Fixed price for historical data
  
  // Fetch PIX settings from the database
  useEffect(() => {
    const fetchPixSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('pix_key_meuresidencial')
          .select('*')
          .limit(1)
          .single();
          
        if (error) {
          console.error('Error fetching PIX key settings:', error);
          toast.error('Não foi possível carregar as configurações de PIX.');
          setLoading(false);
          return;
        }
        
        setPixSettings(data);
        setLoading(false);
      } catch (error) {
        console.error('Error in PIX settings fetch:', error);
        setLoading(false);
      }
    };
    
    fetchPixSettings();
  }, []);
  
  const handleOpenPixDialog = () => {
    if (!pixSettings) {
      toast.error('Não foi possível gerar o PIX. Configurações não encontradas.');
      return;
    }
    
    setIsDialogOpen(true);
  };
  
  const handleClosePixDialog = () => {
    setIsDialogOpen(false);
  };
  
  if (loading) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-28">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!pixSettings) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>Não foi possível carregar as configurações de pagamento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="border-t-4 border-t-blue-500 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-blue-700">Pagamento</CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 mb-4">
            Para solicitar a inclusão ou download de dados históricos, é necessário realizar o pagamento
            de uma taxa única de <span className="font-semibold">R$ 249,00</span>.
          </p>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button 
              onClick={handleOpenPixDialog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Ver QR Code PIX
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleOpenPixDialog}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar código PIX
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Após confirmar o pagamento, iremos processar sua solicitação em até 24 horas úteis.</p>
          </div>
        </CardContent>
      </Card>
      
      {isDialogOpen && pixSettings && (
        <PixDialog
          isOpen={isDialogOpen}
          onClose={handleClosePixDialog}
          pixData={{
            keyType: pixSettings.tipochave as 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE',
            pixKey: pixSettings.chavepix,
            amount: fixedAmount,
            condominiumName: user?.nomeCondominio || 'Condomínio',
            matricula: user?.matricula || '',
            isHistorical: true
          }}
          title="Pagamento de Dados Históricos"
          description="Taxa única para solicitação de dados históricos"
        />
      )}
    </>
  );
};
