
import React, { useState } from 'react';
import { Edit, Trash2, CalendarCheck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CommonAreaReservationDialog } from './CommonAreaReservationDialog';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';

export const CommonAreasList = ({
  commonAreas,
  onEdit,
  onDelete,
  isDeleting,
  fetchReservations,
  viewOnly,
  showReservationButton
}) => {
  const [openAreaId, setOpenAreaId] = useState(null);
  const [openSheetId, setOpenSheetId] = useState(null);
  const [areaReservations, setAreaReservations] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const queryClient = useQueryClient();
  const { user } = useApp();
  const matricula = user?.selectedCondominium || user?.matricula || '';

  const handleReservationsClick = async (areaId) => {
    setIsLoadingReservations(true);
    setOpenSheetId(areaId);
    
    try {
      const reservations = await fetchReservations(areaId);
      setAreaReservations(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setAreaReservations([]);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const handleReservationComplete = () => {
    // Refresh the reservations list for the current area
    if (openSheetId) {
      handleReservationsClick(openSheetId);
    }
    
    // Also refresh the global reservations calendar
    queryClient.invalidateQueries({ queryKey: ['reservations', matricula] });
  };

  const openReservationDialog = (areaId) => {
    setSelectedAreaId(areaId);
    setIsReservationDialogOpen(true);
  };

  if (!commonAreas || commonAreas.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {viewOnly ? 'Não há áreas comuns disponíveis.' : 'Nenhuma área comum cadastrada.'}
      </div>
    );
  }

  return (
    <div className="divide-y">
      <Accordion type="single" collapsible value={openAreaId} onValueChange={setOpenAreaId}>
        {commonAreas.map((area) => (
          <AccordionItem key={area.id} value={area.id} className="border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4">
              <AccordionTrigger className="hover:no-underline py-0">
                <div className="text-left">
                  <h3 className="text-lg font-medium">{area.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {area.description}
                  </p>
                </div>
              </AccordionTrigger>
              
              <div className="flex space-x-2 mt-4 sm:mt-0">
                {/* View reservations button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => handleReservationsClick(area.id)}
                    >
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Reservas
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Reservas - {area.name}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      {isLoadingReservations ? (
                        <div className="py-10 text-center text-muted-foreground">
                          Carregando reservas...
                        </div>
                      ) : areaReservations.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground">
                          Não há reservas para esta área.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {areaReservations.map((reservation) => (
                            <div
                              key={reservation.id}
                              className="border rounded-md p-3 text-sm space-y-1"
                            >
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  {format(parseISO(reservation.reservation_date), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                                <Badge variant="outline">
                                  {reservation.residents.unidade}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground">
                                {reservation.residents.nome_completo}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
                
                {/* Reservation button for residents */}
                {showReservationButton && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center bg-brand-600 hover:bg-brand-700"
                    onClick={() => openReservationDialog(area.id)}
                  >
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    Reservar
                  </Button>
                )}
                
                {/* Edit button for managers */}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => onEdit(area)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Delete button for managers */}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => onDelete(area.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
  
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Descrição</h4>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                </div>
  
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Capacidade</h4>
                    <p className="text-sm text-muted-foreground">{area.capacity} pessoas</p>
                  </div>
  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Horário de Funcionamento</h4>
                    <p className="text-sm text-muted-foreground">
                      {area.opening_time} - {area.closing_time}
                    </p>
                  </div>
  
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      {area.valor && parseFloat(area.valor) > 0 ? 'Valor da Reserva' : 'Reserva'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {area.valor && parseFloat(area.valor) > 0 
                        ? `R$ ${area.valor}` 
                        : 'Gratuita'}
                    </p>
                  </div>
                </div>
  
                <div>
                  <h4 className="text-sm font-medium mb-1">Dias de Funcionamento</h4>
                  <div className="flex flex-wrap gap-2">
                    {area.weekdays?.map((day) => (
                      <Badge key={day} variant="outline">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
  
                <Separator />
  
                <div>
                  <div className="flex items-center mb-1">
                    <Info className="h-4 w-4 mr-1 text-amber-500" />
                    <h4 className="text-sm font-medium">Regras de Utilização</h4>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {area.rules}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Reservation Dialog */}
      <CommonAreaReservationDialog
        open={isReservationDialogOpen}
        setOpen={setIsReservationDialogOpen}
        commonAreaId={selectedAreaId}
        onReservationComplete={handleReservationComplete}
      />
    </div>
  );
};
