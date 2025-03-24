
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewsItem {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  created_at: string;
}

interface NewsHistoryProps {
  newsItems: NewsItem[];
  isLoading: boolean;
}

export const NewsHistory = ({ newsItems, isLoading }: NewsHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetails = (item: NewsItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const displayItems = isExpanded ? newsItems : newsItems.slice(0, 3);

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (newsItems.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Histórico de Novidades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não há novidades anteriores para exibir.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Histórico de Novidades</CardTitle>
          <CardDescription>Novidades anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="truncate max-w-[300px]">
                    {item.short_description}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDetails(item)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {newsItems.length > 3 && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <><ChevronUp className="h-4 w-4 mr-2" /> Mostrar menos</>
                ) : (
                  <><ChevronDown className="h-4 w-4 mr-2" /> Ver mais</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedItem.title}</SheetTitle>
                <SheetDescription>
                  {format(new Date(selectedItem.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <div className="prose prose-sm max-w-none">
                  {selectedItem.full_content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
