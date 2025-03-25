import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Reservation {
  id: string;
  common_area_id: string;
  resident_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  residents: {
    nome_completo: string;
    unidade: string;
  };
  common_areas?: {
    name: string;
    opening_time?: string;
    closing_time?: string;
  };
}

interface CommonAreaReservationsListProps {
  reservations: Reservation[];
  onCancel: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isCancelling: boolean;
  isResidentView?: boolean;
  isProcessing?: boolean;
}

export const CommonAreaReservationsList: React.FC<CommonAreaReservationsListProps> = ({
  reservations,
  onCancel,
  onApprove,
  onReject,
  isCancelling,
  isResidentView = false,
  isProcessing = false
}) => {
  const { user } = useApp();
  const isManager = user?.isAdmin === false && user?.isResident === false;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejeitado</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Cancelado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return dateStr;
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhuma reserva encontrada
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {isResidentView && (
            <TableHead>Área</TableHead>
          )}
          {!isResidentView && (
            <TableHead>Morador</TableHead>
          )}
          <TableHead>Data</TableHead>
          <TableHead>Horário</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((reservation) => (
          <TableRow key={reservation.id}>
            {isResidentView ? (
              <TableCell className="font-medium">{reservation.common_areas?.name}</TableCell>
            ) : (
              <TableCell className="font-medium">
                {reservation.residents.nome_completo} 
                <div className="text-xs text-muted-foreground">
                  Unidade: {reservation.residents.unidade}
                </div>
              </TableCell>
            )}
            <TableCell>{formatDate(reservation.reservation_date)}</TableCell>
            <TableCell>{reservation.start_time} às {reservation.end_time}</TableCell>
            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {(isResidentView && reservation.status === 'pending') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => onCancel(reservation.id)}
                    disabled={isCancelling}
                  >
                    Cancelar
                  </Button>
                )}
                
                {isManager && !isResidentView && (
                  <>
                    {reservation.status === 'pending' && onApprove && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
                        onClick={() => onApprove(reservation.id)}
                        disabled={isProcessing}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                    )}
                    
                    {reservation.status === 'pending' && onReject && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => onReject(reservation.id)}
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    )}
                    
                    {['pending', 'approved'].includes(reservation.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => onCancel(reservation.id)}
                        disabled={isCancelling}
                      >
                        Cancelar
                      </Button>
                    )}
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
