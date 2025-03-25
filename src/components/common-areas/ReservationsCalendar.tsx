
import React, { useState, useEffect } from 'react';
import { format, startOfDay, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, Home, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Reservation {
  id: string;
  common_area_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  common_area: {
    name: string;
    valor?: string;
  };
  residents: {
    nome_completo: string;
    unidade: string;
  };
}

export const ReservationsCalendar: React.FC = () => {
  const { user } = useApp();
  const matricula = user?.selectedCondominium || user?.matricula || '';
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchReservations = async () => {
    if (!matricula) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // First get all common areas for this condominium
      const { data: commonAreas, error: areaError } = await supabase
        .from('common_areas')
        .select('id')
        .eq('matricula', matricula);
      
      if (areaError) {
        console.error('Error fetching common areas:', areaError);
        setLoading(false);
        return;
      }
      
      if (!commonAreas || commonAreas.length === 0) {
        setLoading(false);
        return;
      }
      
      const areaIds = commonAreas.map(area => area.id);
      
      // Then get all reservations for these areas
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('common_area_reservations')
        .select(`
          *,
          common_area:common_area_id (name, valor),
          residents:resident_id (nome_completo, unidade)
        `)
        .in('common_area_id', areaIds)
        .gte('reservation_date', currentDate)
        .order('reservation_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching reservations:', error);
      } else {
        setReservations(data || []);
      }
    } catch (error) {
      console.error('Error in fetchReservations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReservations();
  }, [matricula]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  };

  const formatCurrency = (value: string | undefined) => {
    if (!value) return 'R$ 0,00';
    
    // Convert to number, then format
    const numValue = parseFloat(value);
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card className="border-t-4 border-t-brand-600">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Agenda de Reservas</CardTitle>
            <CardDescription>
              Visualize todas as reservas das áreas comuns
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReservations}
            className="self-end"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">
            Carregando agenda de reservas...
          </div>
        ) : reservations.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            Não há reservas agendadas
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Morador</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    {format(parseISO(reservation.reservation_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{reservation.common_area.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {reservation.start_time} - {reservation.end_time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {reservation.residents.nome_completo}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Home className="h-3 w-3" />
                        {reservation.residents.unidade}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(reservation.common_area.valor)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
