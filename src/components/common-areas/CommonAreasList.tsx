
import React, { useState } from 'react';
import { 
  Eye, 
  Pencil, 
  Trash, 
  Calendar, 
  Users, 
  Clock 
} from 'lucide-react';
import { format } from 'date-fns';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CommonArea {
  id: string;
  name: string;
  description?: string;
  capacity?: number | null;
  rules?: string;
  opening_time?: string;
  closing_time?: string;
  weekdays?: string[];
  created_at: string;
  updated_at: string;
}

interface Reservation {
  id: string;
  common_area_id: string;
  resident_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  residents: {
    nome_completo: string;
    unidade: string;
  };
}

interface CommonAreasListProps {
  commonAreas: CommonArea[];
  onEdit: (area: CommonArea) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  fetchReservations: (id: string) => Promise<any[]>;
}

export const CommonAreasList: React.FC<CommonAreasListProps> = ({
  commonAreas,
  onEdit,
  onDelete,
  isDeleting,
  fetchReservations
}) => {
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const handleViewReservations = async (area: CommonArea) => {
    setSelectedArea(area);
    setLoading(true);
    
    try {
      const data = await fetchReservations(area.id);
      setReservations(data as Reservation[]);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatWeekdays = (weekdays?: string[]) => {
    if (!weekdays || weekdays.length === 0) return 'Nenhum';
    if (weekdays.length === 7) return 'Todos os dias';
    return weekdays.join(', ');
  };
  
  const formatHours = (opening?: string, closing?: string) => {
    if (!opening && !closing) return 'Não definido';
    if (opening && closing) return `${opening} às ${closing}`;
    if (opening) return `A partir de ${opening}`;
    if (closing) return `Até ${closing}`;
    return 'Não definido';
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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead className="hidden md:table-cell">Disponibilidade</TableHead>
              <TableHead className="hidden md:table-cell">Horário</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commonAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma área comum cadastrada
                </TableCell>
              </TableRow>
            ) : (
              commonAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{area.capacity || 'Não definido'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatWeekdays(area.weekdays)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatHours(area.opening_time, area.closing_time)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewReservations(area)}
                        title="Ver reservas"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(area)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(area.id)}
                        disabled={isDeleting}
                        title="Excluir"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArea?.name}</DialogTitle>
            <DialogDescription>
              Informações e reservas para esta área comum
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes da Área</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedArea?.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Descrição:</h4>
                    <p className="text-sm">{selectedArea.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedArea?.capacity ? `${selectedArea.capacity} pessoas` : 'Capacidade não definida'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatHours(selectedArea?.opening_time, selectedArea?.closing_time)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatWeekdays(selectedArea?.weekdays)}
                    </span>
                  </div>
                </div>
                
                {selectedArea?.rules && (
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-gray-500">Regras:</h4>
                    <p className="text-sm whitespace-pre-line">{selectedArea.rules}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reservas</CardTitle>
                <CardDescription>
                  Lista de reservas para esta área
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-6 text-center text-muted-foreground">
                    Carregando reservas...
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    Nenhuma reserva encontrada
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reservations.map(reservation => (
                      <div key={reservation.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{reservation.residents.nome_completo}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(reservation.status)}`}>
                            {getStatusText(reservation.status)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Unidade: {reservation.residents.unidade}</p>
                          <p>Data: {formatDate(reservation.reservation_date)}</p>
                          <p>Horário: {reservation.start_time} às {reservation.end_time}</p>
                          {reservation.notes && <p>Observações: {reservation.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
