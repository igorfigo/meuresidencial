
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

  // Mobile view with cards
  if (isMobile) {
    return (
      <div className="space-y-4">
        {residents.map((resident) => (
          <Card 
            key={resident.id} 
            className={`overflow-hidden border-t-4 border-t-brand-600 shadow-md ${!resident.active ? "bg-gray-100" : ""}`}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{resident.nome_completo}</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPF:</span>
                  <span>{resident.cpf}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unidade:</span>
                  <span>{resident.unidade}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span>{resident.telefone || '-'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E-mail:</span>
                  <span className="truncate max-w-[180px]">{resident.email || '-'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Condomínio:</span>
                  <span>{resident.valor_condominio || '-'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center space-x-2">
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
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(resident)}
                className="flex items-center"
              >
                <Pencil className="h-4 w-4 mr-1" />
                <span>Editar</span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => resident.id && onDelete(resident.id)}
                disabled={isDeleting}
                className="flex items-center text-red-500 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Excluir</span>
              </Button>
            </CardFooter>
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
