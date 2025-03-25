
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useResidentCommonAreas } from '@/hooks/use-resident-common-areas';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { CommonAreaReservationsList } from '@/components/common-areas/CommonAreaReservationsList';

const AreasComunsResidente = () => {
  const { 
    commonAreas, 
    isLoading, 
    selectedDate, 
    setSelectedDate,
    selectedArea, 
    setSelectedArea,
    reservations,
    myReservations,
    startTime,
    setStartTime,
    endTime, 
    setEndTime,
    notes,
    setNotes,
    createReservation,
    isReserving,
    isReservationDialogOpen,
    setIsReservationDialogOpen,
    cancelReservation,
    isCancelling
  } = useResidentCommonAreas();

  const handleReserveClick = (area: any) => {
    setSelectedArea(area);
    setSelectedDate(new Date());
    setStartTime('');
    setEndTime('');
    setNotes('');
    setIsReservationDialogOpen(true);
  };

  const handleCreateReservation = () => {
    if (!selectedArea || !selectedDate || !startTime || !endTime) {
      return;
    }
    
    createReservation({
      areaId: selectedArea.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime,
      endTime,
      notes
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Áreas Comuns</h1>
          <p className="text-muted-foreground">
            Visualize as áreas comuns disponíveis e faça suas reservas
          </p>
        </div>

        <div className="border-t pt-6">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">
              Carregando áreas comuns...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {commonAreas?.map((area) => (
                <Card key={area.id} className="border-t-4 border-t-brand-600 shadow-md">
                  <CardHeader>
                    <CardTitle>{area.name}</CardTitle>
                    <CardDescription>{area.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {area.capacity ? `${area.capacity} pessoas` : 'Capacidade não definida'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {area.opening_time && area.closing_time
                            ? `${area.opening_time} às ${area.closing_time}`
                            : 'Horário não definido'}
                        </span>
                      </div>
                    </div>
                    
                    {area.rules && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Regras:</h4>
                        <p className="text-sm">{area.rules}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleReserveClick(area)} 
                      className="w-full bg-brand-600 hover:bg-brand-700"
                    >
                      Reservar
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {commonAreas?.length === 0 && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  Nenhuma área comum encontrada.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Minhas Reservas</h2>
          <Card className="border-t-4 border-t-brand-600 shadow-md overflow-hidden">
            <CommonAreaReservationsList 
              reservations={myReservations} 
              onCancel={cancelReservation} 
              isCancelling={isCancelling}
              isResidentView={true}
            />
          </Card>
        </div>
      </div>

      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Reserva</DialogTitle>
            <DialogDescription>
              {selectedArea?.name ? `Reservar ${selectedArea.name}` : 'Selecione uma área para reservar'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Data da Reserva</h4>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                className="rounded-md border mx-auto"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start-time" className="text-sm font-medium">Hora de Início</label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full"
                  min={selectedArea?.opening_time || ''}
                  max={selectedArea?.closing_time || ''}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="end-time" className="text-sm font-medium">Hora de Término</label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full"
                  min={startTime || selectedArea?.opening_time || ''}
                  max={selectedArea?.closing_time || ''}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Observações</label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Alguma observação para esta reserva?"
                className="w-full"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setIsReservationDialogOpen(false)} 
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateReservation} 
              className="bg-brand-600 hover:bg-brand-700"
              disabled={!selectedDate || !startTime || !endTime || isReserving}
            >
              {isReserving ? 'Reservando...' : 'Confirmar Reserva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AreasComunsResidente;
