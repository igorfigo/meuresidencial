
import React, { useState, useEffect } from 'react';
import { format, startOfDay, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
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

interface Reservation {
  id: string;
  common_area_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  common_area: {
    name: string;
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
  const [startDate, setStartDate] = useState<Date>(startOfDay(new Date()));
  
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
          common_area:common_area_id (name),
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
  
  const navigateDays = (days: number) => {
    setStartDate(prevDate => startOfDay(addDays(prevDate, days)));
  };
  
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
  
  // Generate an array of 7 days starting from startDate
  const dateRange = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  
  // Group reservations by date
  const reservationsByDate = dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      date,
      reservations: reservations.filter(r => r.reservation_date === dateStr)
    };
  });

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStartDate(startOfDay(new Date()))}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDays(-7)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDays(7)}
            >
              Próximo
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">
            Carregando agenda de reservas...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {reservationsByDate.map(({ date, reservations }) => (
              <div key={date.toString()} className="border rounded-md">
                <div className="bg-muted p-2 text-center font-medium rounded-t-md">
                  {format(date, "EEE, dd/MM", { locale: ptBR })}
                </div>
                <div className="p-2 min-h-[150px] max-h-[250px] overflow-y-auto">
                  {reservations.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      Sem reservas
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reservations.map((reservation) => (
                        <div 
                          key={reservation.id} 
                          className={`p-2 rounded-md border text-xs ${getStatusColor(reservation.status)}`}
                        >
                          <div className="font-medium">{reservation.common_area.name}</div>
                          <div className="flex items-center mt-1 gap-1">
                            <Clock className="h-3 w-3" />
                            {reservation.start_time} - {reservation.end_time}
                          </div>
                          <div className="mt-1 font-medium text-[10px]">
                            {reservation.residents.nome_completo} ({reservation.residents.unidade})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
