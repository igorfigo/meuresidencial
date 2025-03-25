
import React from 'react';
import { FileIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export const BusinessDocumentsList = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Data de Upload</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4 text-gray-500" />
                <span>Documento Exemplo</span>
              </div>
            </TableCell>
            <TableCell>25/03/2024</TableCell>
            <TableCell>PDF</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                Baixar
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
