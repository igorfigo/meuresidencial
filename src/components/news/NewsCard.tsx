
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NewsItem } from '@/hooks/use-news';
import { format } from 'date-fns';

interface NewsCardProps {
  news: NewsItem[];
  isLoading: boolean;
}

export const NewsCard = ({ news, isLoading }: NewsCardProps) => {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  
  // Show only the latest news item
  const latestNews = news.length > 0 ? news[0] : null;
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <>
      <Card className="border-t-4 border-t-brand-600 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-brand-600" />
            Novidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-24 flex items-center justify-center">
              <p className="text-muted-foreground">Carregando novidades...</p>
            </div>
          ) : latestNews ? (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{latestNews.title}</h3>
              <p className="text-sm text-muted-foreground">
                Publicado em {formatDate(latestNews.created_at)}
              </p>
              <p className="text-sm">{latestNews.short_description}</p>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <p className="text-muted-foreground">Nenhuma novidade disponível</p>
            </div>
          )}
        </CardContent>
        {latestNews && (
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setSelectedNews(latestNews)}
            >
              Leia mais
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedNews?.title}</DialogTitle>
            <DialogDescription className="text-sm">
              Publicado em {selectedNews && formatDate(selectedNews.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="whitespace-pre-line">{selectedNews?.full_content}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
