
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarX,
  ChevronDown,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ResidentReservationsListProps {
  reservations: any[];
  isLoading: boolean;
  onCancelReservation: (id: string) => void;
}

export const ResidentReservationsList: React.FC<ResidentReservationsListProps> = ({
  reservations,
  isLoading,
  onCancelReservation,
}) => {
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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

  const isPastReservation = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDate = new Date(dateStr);
    reservationDate.setHours(0, 0, 0, 0);
    return reservationDate < today;
  };

  const canCancel = (reservation: any) => {
    return (
      !isPastReservation(reservation.reservation_date) &&
      (reservation.status === 'pending' || reservation.status === 'approved')
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando suas reservas...</p>
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Você ainda não possui nenhuma reserva.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <Card key={reservation.id} className={`overflow-hidden ${isPastReservation(reservation.reservation_date) ? 'opacity-75' : ''}`}>
          <Collapsible
            open={openItems[reservation.id]}
            onOpenChange={() => toggleItem(reservation.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {reservation.common_areas?.name || 'Área Comum'}
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(reservation.reservation_date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(reservation.status)}>
                  {getStatusText(reservation.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Horário:</span> {reservation.start_time} às {reservation.end_time}
                  </p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6">
                    <ChevronDown className={`h-4 w-4 transition-transform ${openItems[reservation.id] ? 'rotate-180' : ''}`} />
                    <span className="sr-only">Detalhes</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardContent>
            
            <CollapsibleContent>
              <CardContent className="pt-0 border-t">
                {reservation.notes && (
                  <div className="mb-2">
                    <h4 className="text-sm font-medium">Observações:</h4>
                    <p className="text-sm">{reservation.notes}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium">Status:</h4>
                  <p className="text-sm">
                    {reservation.status === 'pending' && 'Aguardando aprovação do síndico ou administrador.'}
                    {reservation.status === 'approved' && 'Sua reserva foi aprovada.'}
                    {reservation.status === 'rejected' && 'Sua reserva foi rejeitada.'}
                    {reservation.status === 'cancelled' && 'Esta reserva foi cancelada.'}
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
            
            {canCancel(reservation) && (
              <CardFooter className="border-t pt-3">
                <AlertDialog 
                  open={cancelReservationId === reservation.id} 
                  onOpenChange={(open) => !open && setCancelReservationId(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setCancelReservationId(reservation.id)}
                    >
                      <CalendarX className="h-4 w-4 mr-1" />
                      Cancelar Reserva
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Não, Manter Reserva</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onCancelReservation(reservation.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Sim, Cancelar Reserva
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            )}
          </Collapsible>
        </Card>
      ))}
    </div>
  );
};
