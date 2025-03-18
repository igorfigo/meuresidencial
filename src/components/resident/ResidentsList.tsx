
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
import { Pencil, Trash2 } from 'lucide-react';
import { Resident } from '@/hooks/use-residents';

interface ResidentsListProps {
  residents: Resident[];
  onEdit: (resident: Resident) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const ResidentsList = ({
  residents,
  onEdit,
  onDelete,
  isDeleting
}: ResidentsListProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {residents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                Nenhum morador cadastrado
              </TableCell>
            </TableRow>
          ) : (
            residents.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell className="font-medium">{resident.nome_completo}</TableCell>
                <TableCell>{resident.cpf}</TableCell>
                <TableCell>{resident.unidade}</TableCell>
                <TableCell>{resident.telefone || '-'}</TableCell>
                <TableCell>{resident.email || '-'}</TableCell>
                <TableCell>{resident.valor_condominio || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(resident)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => resident.id && onDelete(resident.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
