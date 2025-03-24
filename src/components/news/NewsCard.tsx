
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewsItem {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  created_at: string;
}

interface NewsCardProps {
  newsItem: NewsItem | null;
  isLoading: boolean;
}

export const NewsCard = ({ newsItem, isLoading }: NewsCardProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-12 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!newsItem) {
    return (
      <Card className="w-full border-dashed border-2 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle>Sem novidades no momento</CardTitle>
          <CardDescription>Novas informações aparecerão aqui</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não há novidades ou anúncios disponíveis no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Check if news is less than 7 days old
  const createdAt = new Date(newsItem.created_at);
  const isNew = Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000;
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR });

  return (
    <>
      <Card className="w-full border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>{newsItem.title}</CardTitle>
            {isNew && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                NOVO!
              </span>
            )}
          </div>
          <CardDescription>{timeAgo}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{newsItem.short_description}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(true)}>
            <Info className="h-4 w-4 mr-2" />
            Ler mais
          </Button>
        </CardFooter>
      </Card>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{newsItem.title}</SheetTitle>
            <SheetDescription>{timeAgo}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <div className="prose prose-sm max-w-none">
              {newsItem.full_content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
