
import React from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CommonAreasListProps {
  commonAreas: any[];
  isLoading: boolean;
  onSelect: (area: any) => void;
}

export const ResidentCommonAreasList: React.FC<CommonAreasListProps> = ({
  commonAreas,
  isLoading,
  onSelect
}) => {
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
  
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Carregando áreas comuns...
      </div>
    );
  }
  
  if (commonAreas.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Nenhuma área comum disponível para reserva
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {commonAreas.map((area) => (
        <Card key={area.id} className="overflow-hidden border-t-4 border-t-brand-600 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">{area.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {area.description && (
                <p className="text-sm">{area.description}</p>
              )}
              
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {area.capacity ? `${area.capacity} pessoas` : 'Capacidade não definida'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatHours(area.opening_time, area.closing_time)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatWeekdays(area.weekdays)}
                  </span>
                </div>
              </div>
              
              <div className="pt-3">
                <Button 
                  onClick={() => onSelect(area)} 
                  className="w-full bg-brand-600 hover:bg-brand-700"
                >
                  Reservar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
