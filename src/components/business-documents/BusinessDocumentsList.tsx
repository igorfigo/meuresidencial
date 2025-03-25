
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BusinessDocumentsList = () => {
  const [documents, setDocuments] = useState([]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Documentos Armazenados</h2>
        <Button variant="default" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Adicionar Documento
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
          <p className="text-slate-500 mb-4">
            Você ainda não adicionou nenhum documento. Clique no botão acima para começar.
          </p>
          <Button variant="default">
            Adicionar Documento
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Documento</TableHead>
              <TableHead>Data de Upload</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc, index) => (
              <TableRow key={index}>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{doc.file_type}</TableCell>
                <TableCell>{doc.observations}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
