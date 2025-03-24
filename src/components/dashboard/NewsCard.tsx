
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsItem } from '@/hooks/use-news-items';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewsCardProps {
  newsItem: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return '';
    }
  };
  
  return (
    <>
      <Card 
        className="card-hover border-t-4 border-t-brand-600 shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
        onClick={() => setIsOpen(true)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{newsItem.title}</CardTitle>
          {newsItem.created_at && (
            <CardDescription className="text-xs">
              {formatDate(newsItem.created_at)}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm">{newsItem.short_description}</p>
        </CardContent>
      </Card>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{newsItem.title}</DialogTitle>
            {newsItem.created_at && (
              <p className="text-sm text-muted-foreground">{formatDate(newsItem.created_at)}</p>
            )}
          </DialogHeader>
          
          <div className="mt-4 text-sm whitespace-pre-line">{newsItem.full_content}</div>
          
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewsCard;
