
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
  onViewReservations: (area: CommonArea) => void;
  isDeleting: boolean;
}

export const CommonAreasList: React.FC<CommonAreasListProps> = ({
  commonAreas,
  onEdit,
  onDelete,
  onViewReservations,
  isDeleting,
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Capacidade</TableHead>
          <TableHead className="hidden md:table-cell text-center">Disponibilidade</TableHead>
          <TableHead className="hidden md:table-cell text-center">Horário</TableHead>
          <TableHead className="text-center">Ações</TableHead>
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
              <TableCell className="hidden md:table-cell text-center">
                {formatWeekdays(area.weekdays)}
              </TableCell>
              <TableCell className="hidden md:table-cell text-center">
                {formatHours(area.opening_time, area.closing_time)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-purple-500 hover:bg-purple-50 hover:text-purple-600"
                    onClick={() => onViewReservations(area)}
                    title="Ver reservas"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => onEdit(area)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
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
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
