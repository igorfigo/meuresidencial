
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MessageSquare } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface ReportLog {
  id: string;
  matricula: string;
  report_month: string;
  sent_via: 'email' | 'whatsapp';
  sent_count: number;
  created_at: string;
}

interface ReportDeliveryHistoryProps {
  matricula: string;
  refreshTrigger?: number;
}

export function ReportDeliveryHistory({ matricula, refreshTrigger }: ReportDeliveryHistoryProps) {
  const [logs, setLogs] = useState<ReportLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('accounting_report_logs')
          .select('*')
          .eq('matricula', matricula)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        setLogs(data as ReportLog[]);
      } catch (error) {
        console.error('Error fetching report logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (matricula) {
      fetchLogs();
    }
  }, [matricula, refreshTrigger]);
  
  const formatReportMonth = (reportMonth: string) => {
    try {
      const [year, month] = reportMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return format(date, 'MMMM yyyy', { locale: ptBR });
    } catch (error) {
      return reportMonth;
    }
  };
  
  const formatDateTime = (dateTime: string) => {
    try {
      return format(parseISO(dateTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return dateTime;
    }
  };
  
  const getCommunicationIcon = (sentVia: 'email' | 'whatsapp') => {
    switch (sentVia) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };
  
  const getCommunicationLabel = (sentVia: 'email' | 'whatsapp') => {
    switch (sentVia) {
      case 'email':
        return 'E-mail';
      case 'whatsapp':
        return 'WhatsApp';
      default:
        return sentVia;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Envios</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Envios</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês do Relatório</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Envios</TableHead>
                  <TableHead>Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{formatReportMonth(log.report_month)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCommunicationIcon(log.sent_via)}
                        {getCommunicationLabel(log.sent_via)}
                      </div>
                    </TableCell>
                    <TableCell>{log.sent_count}</TableCell>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md border">
            <p className="text-gray-500">Nenhum relatório enviado até o momento</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
