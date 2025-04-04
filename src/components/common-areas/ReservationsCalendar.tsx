
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Home, Trash2, User, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Reservation {
  id: string;
  common_area_id: string;
  reservation_date: string;
  resident_id: string;
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
  const isMobile = useIsMobile();
  
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isManager = user && !user.isAdmin && !user.isResident;
  const isResident = user && user.isResident;
  
  const fetchReservations = async () => {
    if (!matricula) {
      return [];
    }
    
    try {
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
      
      const currentDate = new Date().toISOString().split('T')[0];
      
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
  
  const { data: reservations = [], isLoading, refetch } = useQuery({
    queryKey: ['reservations', matricula],
    queryFn: fetchReservations,
    enabled: !!matricula,
  });

  const handleDeleteClick = (id: string) => {
    setReservationToDelete(id);
  };

  const canDeleteReservation = (reservation: Reservation) => {
    if (isManager) {
      return true;
    } else if (isResident && user?.residentId) {
      return reservation.resident_id === user.residentId;
    }
    return false;
  };

  const isUserReservation = (reservation: Reservation) => {
    return isResident && user?.residentId === reservation.resident_id;
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('common_area_reservations')
        .delete()
        .eq('id', reservationToDelete);
      
      if (error) {
        throw error;
      }
      
      toast.success('Reserva removida com sucesso');
      
      queryClient.invalidateQueries({ queryKey: ['reservations', matricula] });
      
    } catch (error: any) {
      console.error('Error deleting reservation:', error);
      toast.error(`Erro ao excluir: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setReservationToDelete(null);
    }
  };

  // Group reservations by date for mobile view
  const reservationsByDate = reservations.reduce<Record<string, Reservation[]>>((acc, reservation) => {
    const date = reservation.reservation_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(reservation);
    return acc;
  }, {});

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
        ) : isMobile ? (
          // Mobile view - Accordion by date
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(reservationsByDate).map(([date, dateReservations]) => (
              <AccordionItem key={date} value={date}>
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <Badge className="ml-2 bg-brand-600">
                      {dateReservations.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {dateReservations.map((reservation) => (
                      <Card key={reservation.id} className="p-3">
                        <div className="flex flex-col gap-2">
                          <div className="font-medium">{reservation.common_area.name}</div>
                          
                          {!isResident && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Home className="h-3.5 w-3.5 mr-1" />
                              {reservation.residents.unidade}
                            </div>
                          )}
                          
                          {isResident && (
                            <Badge 
                              variant={isUserReservation(reservation) ? "default" : "outline"}
                              className={isUserReservation(reservation) ? "bg-brand-600 mt-1 mb-1" : "mt-1 mb-1"}
                            >
                              {isUserReservation(reservation) ? "Minha Reserva" : "Outro Morador"}
                            </Badge>
                          )}
                          
                          <div className="flex justify-end">
                            {canDeleteReservation(reservation) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDeleteClick(reservation.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          // Desktop view - Table
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Data</TableHead>
                <TableHead className="text-center">Área</TableHead>
                {!isResident && <TableHead className="text-center">Unidade</TableHead>}
                {isResident && <TableHead className="text-center">Reserva</TableHead>}
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium text-center">
                    {format(parseISO(reservation.reservation_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-center">{reservation.common_area.name}</TableCell>
                  {!isResident && (
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Home className="h-3 w-3" />
                        {reservation.residents.unidade}
                      </div>
                    </TableCell>
                  )}
                  {isResident && (
                    <TableCell className="text-center">
                      <Badge 
                        variant={isUserReservation(reservation) ? "default" : "outline"}
                        className={isUserReservation(reservation) ? "bg-brand-600" : ""}
                      >
                        {isUserReservation(reservation) ? "Minha Reserva" : "Outro Morador"}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    {canDeleteReservation(reservation) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 mx-auto"
                        onClick={() => handleDeleteClick(reservation.id)}
                        title="Remover reserva"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={!!reservationToDelete} onOpenChange={(open) => !open && setReservationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta reserva? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
