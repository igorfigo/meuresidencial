
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  const queryClient = useQueryClient();
  
  const fetchReservations = async () => {
    if (!matricula) {
      return [];
    }
    
    try {
      // First get all common areas for this condominium
      const { data: commonAreas, error: areaError } = await supabase
        .from('common_areas')
        .select('id')
        .eq('matricula', matricula);
      
      if (areaError) {
        console.error('Error fetching common areas:', areaError);
        return [];
      }
      
      if (!commonAreas || commonAreas.length === 0) {
        return [];
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
        return [];
      }
      
      return data as unknown as Reservation[];
    } catch (error) {
      console.error('Error in fetchReservations:', error);
      return [];
    }
  };
  
  // Use React Query to manage the data fetching and caching
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations', matricula],
    queryFn: fetchReservations,
    enabled: !!matricula,
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
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
                <TableHead>Morador</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
