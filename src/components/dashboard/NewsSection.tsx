
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNewsItems } from '@/hooks/use-news-items';
import NewsCard from './NewsCard';

export const NewsSection: React.FC = () => {
  const { newsItems, isLoading, error } = useNewsItems();
  
  if (isLoading) {
    return (
      <Card className="border-t-4 border-t-brand-600 shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="border-t-4 border-t-brand-600 shadow-md">
        <CardContent className="p-6">
          <p className="text-center text-red-500">Não foi possível carregar as novidades.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (newsItems.length === 0) {
    return (
      <Card className="border-t-4 border-t-brand-600 shadow-md">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Sem novidades no momento.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Exibimos apenas o aviso mais recente
  const latestNews = newsItems[0];
  
  return <NewsCard newsItem={latestNews} />;
};

export default NewsSection;
