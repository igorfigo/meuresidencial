
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Info, BadgeInfo } from 'lucide-react';
import { generatePixCode, generatePixQRCode } from '@/utils/pixGenerator';
import { PixDialog } from './PixDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface HistoricalDataPixSectionProps {
  matricula: string;
  unit?: string;
}

export const HistoricalDataPixSection = ({ matricula, unit }: HistoricalDataPixSectionProps) => {
  const [isPixDialogOpen, setIsPixDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const { data: pixSettings, isLoading: isLoadingPixSettings } = useQuery({
    queryKey: ['pix-settings-historical', matricula],
    queryFn: async () => {
      try {
        // Changed from pix_receipt_settings to pix_key_meuresidencial
        const { data, error } = await supabase
          .from('pix_key_meuresidencial')
          .select('tipochave, chavepix')
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
      <Card className={`${isMobile ? 'mb-4' : 'mb-6'} border-t-4 border-t-brand-600 shadow-md`}>
        <CardHeader className={`bg-blue-50 ${isMobile ? 'pb-2 pt-3' : 'pb-3'}`}>
          <CardTitle className={`flex items-center text-blue-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
            <BadgeInfo className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-blue-600`} />
            Pagamento para Dados Históricos
          </CardTitle>
        </CardHeader>
        
        <CardContent className={isMobile ? "px-3 py-3" : "pt-4"}>
          <div className={`text-sm text-gray-600 space-y-${isMobile ? '1.5' : '2'}`}>
            {!isMobile ? (
              <>
                <p>
                  O serviço de dados históricos permite tanto a inclusão quanto o download
                  do histórico do seu condomínio no sistema.
                </p>
                <p>
                  Após o pagamento, nossa equipe entrará em contato para processar sua solicitação
                  e disponibilizar os dados em até 3 dias úteis.
                </p>
              </>
            ) : (
              <p>
                Este serviço permite inclusão/download do histórico do seu condomínio.
                Após pagamento, processaremos em até 3 dias úteis.
              </p>
            )}
            
            <div className={`flex items-start mt-${isMobile ? '2' : '3'} bg-amber-50 ${isMobile ? 'p-2' : 'p-3'} rounded-md border border-amber-200`}>
              <Info className={`${isMobile ? 'h-4 w-4 mt-0' : 'h-5 w-5 mt-0.5'} text-amber-600 flex-shrink-0`} />
              <div className={`ml-2 text-amber-800 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                <p className="font-medium mb-1">Valor único: R$ 249,00</p>
                <p>Este é um serviço avulso cobrado uma única vez para todos os dados históricos do condomínio.</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <Separator />
        
        <CardFooter className={`bg-gray-50 ${isMobile ? 'p-3' : 'p-4'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Carregando...</span>
            </div>
          ) : hasPixSettings ? (
            <Button 
              onClick={openPixDialog} 
              variant="default" 
              className="w-full bg-brand-600 hover:bg-brand-700"
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
