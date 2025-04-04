
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { Resident } from '@/hooks/use-residents';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResidentsListProps {
  residents: Resident[];
  onEdit: (resident: Resident) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  isDeleting: boolean;
  isTogglingActive: boolean;
}

export const ResidentsList = ({
  residents,
  onEdit,
  onDelete,
  onToggleActive,
  isDeleting,
  isTogglingActive
}: ResidentsListProps) => {
  const isMobile = useIsMobile();

  if (residents.length === 0) {
    return (
      <Card className="overflow-hidden border-t-4 border-t-brand-600 shadow-md">
        <div className="text-center py-8 text-muted-foreground">
          Nenhum morador cadastrado
        </div>
      </Card>
    );
  }

  // Mobile view with simplified cards showing only essential info
  if (isMobile) {
    return (
      <div className="space-y-2">
        {residents.map((resident) => (
          <Card 
            key={resident.id} 
            className={`overflow-hidden border-l-4 ${
              resident.active ? "border-l-brand-600" : "border-l-gray-400"
            } shadow-sm ${!resident.active ? "bg-gray-100" : ""}`}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-medium text-base truncate">{resident.nome_completo}</h3>
                  <p className="text-sm text-muted-foreground">Unidade: {resident.unidade}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(resident)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => resident.id && onDelete(resident.id)}
                    disabled={isDeleting}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                  
                  <Switch
                    checked={resident.active}
                    onCheckedChange={(checked) => resident.id && onToggleActive(resident.id, checked)}
                    disabled={isTogglingActive}
                    aria-label={resident.active ? "Ativo" : "Inativo"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop view with table
  return (
    <Card className="overflow-hidden border-t-4 border-t-brand-600 shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="text-center">CPF</TableHead>
            <TableHead className="text-center">Unidade</TableHead>
            <TableHead className="text-center">Telefone</TableHead>
            <TableHead className="text-center">E-mail</TableHead>
            <TableHead className="text-center">Valor Condomínio</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {residents.map((resident) => (
            <TableRow key={resident.id} className={!resident.active ? "bg-gray-100" : ""}>
              <TableCell className="font-medium">{resident.nome_completo}</TableCell>
              <TableCell className="text-center">{resident.cpf}</TableCell>
              <TableCell className="text-center">{resident.unidade}</TableCell>
              <TableCell className="text-center">{resident.telefone || '-'}</TableCell>
              <TableCell className="text-center">{resident.email || '-'}</TableCell>
              <TableCell className="text-center">{resident.valor_condominio || '-'}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Switch
                    checked={resident.active}
                    onCheckedChange={(checked) => resident.id && onToggleActive(resident.id, checked)}
                    disabled={isTogglingActive}
                    aria-label={resident.active ? "Ativo" : "Inativo"}
                  />
                  <span className="text-sm text-muted-foreground">
                    {resident.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(resident)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => resident.id && onDelete(resident.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
