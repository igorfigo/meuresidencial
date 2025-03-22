import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from '@/hooks/use-user';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { ptBR } from 'date-fns/locale';
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface ReportItem {
  date: string;
  description: string;
  type: 'Receita' | 'Despesa';
  value: number;
}

const AccountingReport = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [reportLogs, setReportLogs] = useState<any[]>([]);

  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i));

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchReportData();
      fetchReportLogs();
    }
  }, [selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const matricula = user?.user_metadata?.matricula;
      if (!matricula) {
        toast({
          title: "Erro",
          description: "Matrícula do condomínio não encontrada",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-accounting-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricula,
          report_month: selectedMonth,
          report_year: selectedYear,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Erro",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReportLogs = async () => {
    try {
      const matricula = user?.user_metadata?.matricula;
      if (!matricula) {
        toast({
          title: "Erro",
          description: "Matrícula do condomínio não encontrada",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-accounting-report-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricula,
          report_month: selectedMonth,
          report_year: selectedYear,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report logs');
      }

      const data = await response.json();
      setReportLogs(data);
    } catch (error) {
      console.error("Error fetching report logs:", error);
      toast({
        title: "Erro",
        description: "Failed to fetch report logs",
        variant: "destructive",
      });
    }
  };

  const sendReportToResidents = async () => {
    try {
      setIsSending(true);
      
      if (!selectedMonth || !selectedYear) {
        toast({
          title: "Erro",
          description: "Selecione o mês e ano para enviar o relatório",
          variant: "destructive",
        });
        return;
      }

      const matricula = user?.user_metadata?.matricula;
      if (!matricula) {
        toast({
          title: "Erro",
          description: "Matrícula do condomínio não encontrada",
          variant: "destructive",
        });
        return;
      }

      // Get the HTML content of the report
      const reportElement = document.getElementById('report-to-print');
      if (!reportElement) {
        toast({
          title: "Erro", 
          description: "Não foi possível gerar o conteúdo do relatório",
          variant: "destructive",
        });
        return;
      }
      
      // Get the HTML content
      const reportHtml = reportElement.innerHTML;
      
      // Style fixes for email
      const styledReportHtml = `
        <style>
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold;
          }
          h3 {
            margin-top: 20px;
            margin-bottom: 10px;
            color: #333;
          }
          .total-row {
            font-weight: bold;
            background-color: #f5f5f5;
          }
        </style>
        ${reportHtml}
      `;

      // Send the report to the server
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-accounting-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matricula,
            report_month: selectedMonth,
            report_year: selectedYear,
            report_html: styledReportHtml
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar o relatório");
      }
      
      // Successfully sent the report
      toast({
        title: "Sucesso",
        description: `Relatório enviado com sucesso para ${data.sent_count} moradores`,
      });
      
      // Refresh the logs
      fetchReportLogs();
      
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      toast({
        title: "Erro",
        description: `Erro ao enviar relatório: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const calculateTotals = () => {
    let totalReceitas = 0;
    let totalDespesas = 0;

    reportData.forEach(item => {
      if (item.type === 'Receita') {
        totalReceitas += item.value;
      } else {
        totalDespesas += item.value;
      }
    });

    return { totalReceitas, totalDespesas };
  };

  const { totalReceitas, totalDespesas } = calculateTotals();

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione o mês e ano para gerar o relatório</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Select onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar Mês" defaultValue={selectedMonth} />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar Ano" defaultValue={selectedYear} />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchReportData} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Gerando...
              </>
            ) : (
              "Gerar Relatório"
            )}
          </Button>
          <Button onClick={sendReportToResidents} disabled={isSending}>
            {isSending ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                Enviar por Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Display */}
      {reportData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Contas - {selectedMonth}/{selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="report-to-print">
              <h3>Receitas</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData
                    .filter(item => item.type === 'Receita')
                    .map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>R$ {item.value.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  <TableRow className="total-row">
                    <TableCell colSpan={2}>Total Receitas</TableCell>
                    <TableCell>R$ {totalReceitas.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h3>Despesas</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData
                    .filter(item => item.type === 'Despesa')
                    .map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>R$ {item.value.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  <TableRow className="total-row">
                    <TableCell colSpan={2}>Total Despesas</TableCell>
                    <TableCell>R$ {totalDespesas.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Logs */}
      {reportLogs.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Histórico de Envios</CardTitle>
            <CardDescription>Registros dos últimos envios deste relatório</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Enviado via</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Nº de Envios</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.created_at}</TableCell>
                    <TableCell>{log.sent_via}</TableCell>
                    <TableCell>{log.sent_units}</TableCell>
                    <TableCell>{log.sent_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountingReport;
