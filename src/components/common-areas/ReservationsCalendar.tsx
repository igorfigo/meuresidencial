
import React, { useState, useEffect } from 'react';
import { format, startOfDay, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, Home } from 'lucide-react';
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const itemsPerPage = 6;
  
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

  // Pagination logic
  const totalPages = Math.ceil(reservations.length / itemsPerPage);
  const paginatedReservations = reservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <div className="flex gap-2">
            <Tabs defaultValue="list" onValueChange={(value) => setViewType(value as 'list' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="calendar">Calendário</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">
            Carregando agenda de reservas...
          </div>
        ) : (
          <TabsContent value="list" className="mt-0">
            {reservations.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                Não há reservas cadastradas
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4">
                  {paginatedReservations.map((reservation) => (
                    <Card key={reservation.id} className="overflow-hidden">
                      <div className={`h-2 ${getStatusColor(reservation.status)}`} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-lg">{reservation.common_area.name}</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(reservation.status)}`}>
                            {getStatusText(reservation.status)}
                          </div>
                        </div>
                        
                        <div className="mt-3 space-y-1.5 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(reservation.reservation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{reservation.start_time} - {reservation.end_time}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{reservation.residents.nome_completo}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <span>Unidade: {reservation.residents.unidade}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => handlePageChange(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </TabsContent>
        )}
          
        <TabsContent value="calendar" className="mt-0">
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
        </TabsContent>
      </CardContent>
    </Card>
  );
};
