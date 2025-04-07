
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Document } from '@/hooks/use-documents';
import { useIsMobile } from '@/hooks/use-mobile';
import { useApp } from '@/contexts/AppContext';

interface DocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (id: string) => void;
  isResident?: boolean;
}

const getDocumentTypeLabel = (tipo: string) => {
  const types: Record<string, string> = {
    'convenção': 'Convenção do Condomínio',
    'regulamento': 'Regulamento Interno',
    'ata': 'Ata de Assembléia',
    'planta': 'Planta do Edifício',
    'apolice': 'Apólice de Seguro',
    'vistoria': 'Auto de Vistoria do Corpo de Bombeiros'
  };
  
  return types[tipo] || tipo;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onEdit,
  onDelete,
  isResident
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  const isMobile = useIsMobile();
  const { user } = useApp();

  // Determine if user is resident for edge-to-edge styling
  const isUserResident = isResident || (user?.isResident === true);

  return (
    <Card className={`overflow-hidden border-l-4 border-l-brand-600 ${isUserResident && isMobile ? 'rounded-none border-x-0' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-base">
                {getDocumentTypeLabel(document.tipo)}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>{formatDate(document.data_cadastro)}</span>
              </div>
            </div>
            <div>
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex mt-2 gap-1 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(document)}
              title="Ver detalhes"
            >
              <Eye className="h-4 w-4 mr-1" />
              <span className="text-xs">Detalhes</span>
            </Button>
            
            {!isResident && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(document)}
                title="Editar"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span className="text-xs">Editar</span>
              </Button>
            )}
            
            {!isResident && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(document.id!)}
                title="Excluir"
              >
                <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                <span className="text-xs text-red-500">Excluir</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
