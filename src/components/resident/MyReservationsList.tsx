
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface MyReservationsListProps {
  reservations: any[];
  isLoading: boolean;
  onCancel: (id: string) => void;
  isDeleting: boolean;
}

export const MyReservationsList: React.FC<MyReservationsListProps> = ({
  reservations,
  isLoading,
  onCancel,
  isDeleting
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
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
        return 'Aprovada';
      case 'rejected':
        return 'Rejeitada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendente';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Carregando suas reservas...
      </div>
    );
  }
  
  if (reservations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Você ainda não fez nenhuma reserva
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <Card key={reservation.id} className="border-t-4 border-t-brand-600">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg">{reservation.common_areas.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatDate(reservation.reservation_date)}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(reservation.status)}`}>
              {getStatusText(reservation.status)}
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {reservation.start_time} às {reservation.end_time}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Solicitado em: {format(new Date(reservation.created_at), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
              
              {reservation.notes && (
                <div className="text-sm">
                  <p className="font-medium">Observações:</p>
                  <p className="text-muted-foreground">{reservation.notes}</p>
                </div>
              )}
              
              {reservation.status === 'pending' && (
                <div className="pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 w-full"
                        disabled={isDeleting}
                      >
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
                        <AlertDialogCancel>Não, manter reserva</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onCancel(reservation.id)} 
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          Sim, cancelar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
