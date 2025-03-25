import React, { useState } from 'react';
import { 
  Eye, 
  Pencil, 
  Trash, 
  Calendar, 
  Users, 
  Clock,
  CalendarPlus,
  DollarSign 
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
import { CommonAreaReservationDialog } from './CommonAreaReservationDialog';
import { formatCurrency, BRLToNumber } from '@/utils/currency';

interface CommonArea {
  id: string;
  name: string;
  description?: string;
  capacity?: number | null;
  rules?: string;
  opening_time?: string;
  closing_time?: string;
  weekdays?: string[];
  valor?: string;
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
  onEdit?: (area: CommonArea) => void;
  onDelete?: (id: string) => void;
  isDeleting: boolean;
  fetchReservations: (id: string) => Promise<any[]>;
  viewOnly?: boolean;
  onCreateReservation?: (commonAreaId: string) => void;
  showReservationButton?: boolean;
}

export const CommonAreasList: React.FC<CommonAreasListProps> = ({
  commonAreas,
  onEdit,
  onDelete,
  isDeleting,
  fetchReservations,
  viewOnly = false,
  onCreateReservation,
  showReservationButton = false
}) => {
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  
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

  const handleReservationClick = (area: CommonArea) => {
    setSelectedArea(area);
    setIsReservationOpen(true);
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

  const getValueDisplay = (valor?: string) => {
    if (!valor) return 'Grátis';
    
    // Try to detect if it's already formatted with R$
    if (valor.includes('R$')) {
      return valor.trim();
    }
    
    // Otherwise, format it
    const numValue = parseFloat(valor.replace(',', '.'));
    return isNaN(numValue) ? 'Grátis' : formatCurrency(numValue);
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="text-center">Capacidade</TableHead>
            <TableHead className="hidden md:table-cell text-center">Disponibilidade</TableHead>
            <TableHead className="hidden md:table-cell text-center">Horário</TableHead>
            <TableHead className="text-center">Valor</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commonAreas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhuma área comum cadastrada
              </TableCell>
            </TableRow>
          ) : (
            commonAreas.map((area) => (
              <TableRow key={area.id}>
                <TableCell className="font-medium">{area.name}</TableCell>
                <TableCell className="text-center">{area.capacity || 'Não definido'}</TableCell>
                <TableCell className="hidden md:table-cell text-center">
                  {formatWeekdays(area.weekdays)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-center">
                  {formatHours(area.opening_time, area.closing_time)}
                </TableCell>
                <TableCell className="text-center">
                  {getValueDisplay(area.valor)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-purple-500 hover:bg-purple-50 hover:text-purple-600"
                      onClick={() => handleViewReservations(area)}
                      title="Ver reservas"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {showReservationButton && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-500 hover:bg-green-50 hover:text-green-600"
                        onClick={() => handleReservationClick(area)}
                        title="Reservar"
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {!viewOnly && (
                      <>
                        {onEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => onEdit(area)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => onDelete(area.id)}
                            disabled={isDeleting}
                            title="Excluir"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedArea?.name}</DialogTitle>
            <DialogDescription>
              Informações para esta área comum
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Card className="border-t-4 border-t-brand-600">
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
                  
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedArea?.valor ? getValueDisplay(selectedArea.valor) : 'Grátis'}
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Reservation Dialog */}
      {selectedArea && (
        <CommonAreaReservationDialog
          open={isReservationOpen}
          onOpenChange={setIsReservationOpen}
          commonArea={selectedArea}
          onSuccess={() => {
            setIsReservationOpen(false);
            // Refresh reservations if the details dialog is open
            if (isDetailsOpen && selectedArea) {
              handleViewReservations(selectedArea);
            }
          }}
        />
      )}
    </>
  );
};
