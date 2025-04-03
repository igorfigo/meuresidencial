
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Info, BadgeInfo } from 'lucide-react';
import { generatePixCode, generatePixQRCode } from '@/utils/pixGenerator';
import { PixDialog } from './PixDialog';

interface HistoricalDataPixSectionProps {
  matricula: string;
  unit?: string;
}

export const HistoricalDataPixSection = ({ matricula, unit }: HistoricalDataPixSectionProps) => {
  const [isPixDialogOpen, setIsPixDialogOpen] = useState(false);
  
  const { data: pixSettings, isLoading: isLoadingPixSettings } = useQuery({
    queryKey: ['pix-settings-historical', matricula],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('pix_receipt_settings')
          .select('tipochave, chavepix')
          .eq('matricula', matricula)
          .single();
          
        if (error) {
          console.error('Error fetching PIX settings:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error('Error in PIX settings fetch:', err);
        return null;
      }
    },
    enabled: !!matricula
  });
  
  const { data: condominiumData, isLoading: isLoadingCondominium } = useQuery({
    queryKey: ['condominium-data-historical', matricula],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('condominiums')
          .select('nomecondominio')
          .eq('matricula', matricula)
          .single();
          
        if (error) {
          console.error('Error fetching condominium data:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error('Error in condominium data fetch:', err);
        return null;
      }
    },
    enabled: !!matricula
  });
  
  const isLoading = isLoadingPixSettings || isLoadingCondominium;
  const hasPixSettings = pixSettings?.chavepix && pixSettings?.tipochave;
  
  const openPixDialog = () => {
    setIsPixDialogOpen(true);
  };
  
  const closePixDialog = () => {
    setIsPixDialogOpen(false);
  };
  
  return (
    <>
      <Card className="mb-6 border-t-4 shadow-md" style={{ borderTopColor: 'var(--primary)' }}>
        <CardHeader className="bg-blue-50 pb-3">
          <CardTitle className="flex items-center text-blue-800 text-lg">
            <BadgeInfo className="h-5 w-5 mr-2 text-blue-600" />
            Pagamento para Dados Históricos
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              O serviço de dados históricos permite tanto a inclusão quanto o download
              do histórico do seu condomínio no sistema.
            </p>
            <p>
              Após o pagamento, nossa equipe entrará em contato para processar sua solicitação
              e disponibilizar os dados em até 3 dias úteis.
            </p>
            
            <div className="flex items-start mt-3 bg-amber-50 p-3 rounded-md border border-amber-200">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="ml-2 text-amber-800 text-xs">
                <p className="font-medium mb-1">Valor único: R$ 249,00</p>
                <p>Este é um serviço avulso cobrado uma única vez para todos os dados históricos do condomínio.</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <Separator />
        
        <CardFooter className="bg-gray-50 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Carregando...</span>
            </div>
          ) : hasPixSettings ? (
            <Button 
              onClick={openPixDialog} 
              variant="default" 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Gerar PIX para Pagamento
            </Button>
          ) : (
            <div className="w-full text-center text-sm text-gray-500 py-1">
              Chave PIX não configurada pelo condomínio
            </div>
          )}
        </CardFooter>
      </Card>
      
      {isPixDialogOpen && pixSettings && condominiumData && (
        <PixDialog
          isOpen={isPixDialogOpen}
          onClose={closePixDialog}
          pixData={{
            keyType: pixSettings.tipochave as 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE',
            pixKey: pixSettings.chavepix,
            amount: 249.00,
            condominiumName: condominiumData.nomecondominio || matricula || '',
            matricula: matricula,
            unit: unit
          }}
          month={(new Date().getMonth() + 1).toString().padStart(2, '0')}
          year={new Date().getFullYear().toString()}
          isHistorical={true}
        />
      )}
    </>
  );
};
