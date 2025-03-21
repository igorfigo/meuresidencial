
import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, ArrowDownUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getBalanceAdjustments } from '@/integrations/supabase/client';
import { BRLToNumber } from '@/utils/currency';

interface BalanceHistoryDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  matricula: string;
}

export const BalanceHistoryDialog = ({ isOpen, setIsOpen, matricula }: BalanceHistoryDialogProps) => {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && matricula) {
      fetchBalanceHistory();
    }
  }, [isOpen, matricula]);

  const fetchBalanceHistory = async () => {
    try {
      setIsLoading(true);
      const data = await getBalanceAdjustments(matricula);
      setAdjustments(data);
    } catch (error) {
      console.error('Error fetching balance history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const getChangeIcon = (prevBalance: string, newBalance: string) => {
    const prevValue = BRLToNumber(prevBalance);
    const newValue = BRLToNumber(newBalance);
    
    if (newValue > prevValue) {
      return <ArrowUpRight className="h-5 w-5 text-green-500" />;
    } else if (newValue < prevValue) {
      return <ArrowDownRight className="h-5 w-5 text-red-500" />;
    } else {
      return <ArrowDownUp className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Histórico de Alterações do Saldo</DialogTitle>
          <DialogDescription>
            Registro de todas as alterações manuais realizadas no saldo.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Carregando histórico...
          </div>
        ) : adjustments.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Nenhum registro de alteração de saldo encontrado.
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {adjustments.map((adjustment) => (
                <div 
                  key={adjustment.id} 
                  className="border rounded-md p-3 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getChangeIcon(adjustment.previous_balance, adjustment.new_balance)}
                      <div>
                        <div className="font-medium">
                          De R$ {adjustment.previous_balance} para R$ {adjustment.new_balance}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(adjustment.adjustment_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {adjustment.observations && (
                    <div className="text-sm text-gray-700 mt-2 border-t pt-2">
                      <span className="font-medium">Observações:</span> {adjustment.observations}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
