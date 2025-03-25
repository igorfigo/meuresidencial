
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Info, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';

interface CommonAreasListProps {
  commonAreas: any[];
  onReserve: (areaId: string) => void;
  isLoading: boolean;
  fetchReservations: (areaId: string) => Promise<any[]>;
}

export const CommonAreaReservationsList: React.FC<CommonAreasListProps> = ({
  commonAreas,
  onReserve,
  isLoading,
  fetchReservations,
}) => {
  const { user } = useApp();
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [areaReservations, setAreaReservations] = useState<any[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  const handleViewDetails = async (area: any) => {
    setSelectedArea(area);
    setDetailsOpen(true);
    setIsLoadingReservations(true);
    
    try {
      const reservations = await fetchReservations(area.id);
      setAreaReservations(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const formatWeekdays = (weekdays?: string[]) => {
    if (!weekdays || weekdays.length === 0) return 'Nenhum';
    if (weekdays.length === 7) return 'Todos os dias';
    
    const orderedWeekdays = new Map([
      ['Segunda', 1],
      ['Terça', 2],
      ['Quarta', 3],
      ['Quinta', 4],
      ['Sexta', 5],
      ['Sábado', 6],
      ['Domingo', 7]
    ]);
    
    return [...weekdays]
      .sort((a, b) => (orderedWeekdays.get(a) || 0) - (orderedWeekdays.get(b) || 0))
      .join(', ');
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando áreas comuns...</p>
      </div>
    );
  }

  if (!commonAreas || commonAreas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma área comum disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {commonAreas.map((area) => (
        <Card key={area.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="bg-brand-50 border-b pb-3">
            <CardTitle className="text-lg font-bold">{area.name}</CardTitle>
            <CardDescription>
              {area.description?.substring(0, 100)}
              {area.description && area.description.length > 100 ? '...' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{area.capacity || 'Não definido'} pessoas</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatWeekdays(area.weekdays)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatHours(area.opening_time, area.closing_time)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetails(area)}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver regras e reservas existentes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button 
              onClick={() => onReserve(area.id)}
              className="bg-brand-600 hover:bg-brand-700"
              size="sm"
            >
              Solicitar Reserva
            </Button>
          </CardFooter>
        </Card>
      ))}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedArea?.name}</DialogTitle>
            <DialogDescription>
              Informações e regras para utilização
            </DialogDescription>
          </DialogHeader>
          
          {selectedArea && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Descrição:</h4>
                <p className="text-sm">{selectedArea.description || 'Nenhuma descrição disponível.'}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Regras:</h4>
                <p className="text-sm whitespace-pre-line">{selectedArea.rules || 'Nenhuma regra específica.'}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Disponibilidade:</h4>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{selectedArea.capacity || 'Não definido'} pessoas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatWeekdays(selectedArea.weekdays)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatHours(selectedArea.opening_time, selectedArea.closing_time)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium text-muted-foreground">Próximas Reservas:</h4>
                {isLoadingReservations ? (
                  <p className="text-sm text-center py-2">Carregando reservas...</p>
                ) : areaReservations.length === 0 ? (
                  <p className="text-sm">Nenhuma reserva próxima para esta área.</p>
                ) : (
                  <div className="space-y-2">
                    {areaReservations.map((reservation) => (
                      <div key={reservation.id} className="text-sm border rounded p-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p><strong>Data:</strong> {format(new Date(reservation.reservation_date), 'dd/MM/yyyy')}</p>
                            <p><strong>Horário:</strong> {reservation.start_time} às {reservation.end_time}</p>
                            <p><strong>Morador:</strong> {reservation.residents?.nome_completo || 'Não disponível'}</p>
                          </div>
                          <Badge className={getStatusColor(reservation.status)}>
                            {getStatusText(reservation.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
