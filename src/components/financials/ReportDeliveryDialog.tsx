
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matricula: string;
  selectedMonth: string;
  balance: string;
  totalIncome: string;
  totalExpense: string;
  onSuccess: () => void;
}

export function ReportDeliveryDialog({
  open,
  onOpenChange,
  matricula,
  selectedMonth,
  balance,
  totalIncome,
  totalExpense,
  onSuccess
}: ReportDeliveryDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse the selected month (format: 'yyyy-MM')
  const getMonthInfo = () => {
    const yearMonth = selectedMonth.split('-');
    const year = yearMonth[0];
    const month = yearMonth[1];
    
    // Get month name in Portuguese
    const date = parse(selectedMonth + '-01', 'yyyy-MM-dd', new Date());
    const monthName = format(date, 'MMMM', { locale: ptBR });
    
    return { year, month, monthName };
  };
  
  const handleSendEmail = async () => {
    setIsLoading(true);
    
    try {
      const { year, month, monthName } = getMonthInfo();
      
      const { data, error } = await supabase.functions.invoke('send-accounting-report', {
        body: {
          matricula,
          month,
          monthName,
          year,
          balance,
          totalIncome,
          totalExpense
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Relatório enviado com sucesso",
        description: `${data.message}`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending report:", error);
      toast({
        title: "Erro ao enviar relatório",
        description: "Ocorreu um erro ao enviar o relatório. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prestar Contas aos Moradores</DialogTitle>
          <DialogDescription>
            Escolha o método de comunicação para enviar a prestação de contas do mês {getMonthInfo().monthName} de {getMonthInfo().year}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button 
            onClick={handleSendEmail} 
            className="flex flex-col items-center justify-center h-28 gap-2" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Mail className="h-6 w-6" />}
            <span>Enviar E-mail aos Moradores</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-28 gap-2" 
            disabled={true}
          >
            <MessageSquare className="h-6 w-6" />
            <span>Enviar WhatsApp aos Moradores</span>
            <span className="text-xs text-muted-foreground">(Em breve)</span>
          </Button>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
