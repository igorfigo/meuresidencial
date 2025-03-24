
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNews } from '@/hooks/use-news';
import { Bell, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ptBR } from 'date-fns/locale';

export function AnnouncementCard() {
  const { newsItems, isLoading, fetchNewsItems } = useNews();
  const { user } = useApp();

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const activeNewsItems = newsItems.filter(item => item.is_active);

  if (isLoading) {
    return (
      <Card className="shadow-md border-t-4 border-t-brand-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Bell className="h-5 w-5 mr-2 text-brand-600" />
            Avisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNewsItems.length === 0) {
    return (
      <Card className="shadow-md border-t-4 border-t-brand-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Bell className="h-5 w-5 mr-2 text-brand-600" />
            Avisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm flex flex-col items-center justify-center py-6">
            <Info className="h-12 w-12 text-gray-400 mb-2" />
            <p>Nenhum aviso no momento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-t-4 border-t-brand-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Bell className="h-5 w-5 mr-2 text-brand-600" />
          Avisos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeNewsItems.slice(0, 3).map((item) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <div className="cursor-pointer hover:bg-gray-50 rounded-md p-2 -mx-2 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(item.created_at), "dd 'de' MMMM", { locale: ptBR })}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.short_description}</p>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{item.title}</DialogTitle>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(item.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                  </div>
                </DialogHeader>
                <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                  {item.full_content}
                </div>
                <div className="mt-4 flex justify-end">
                  <DialogClose asChild>
                    <Button variant="outline">Fechar</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          ))}
          
          {activeNewsItems.length > 3 && (
            <div className="text-center pt-2">
              <Button variant="link" className="text-brand-600" onClick={() => 
                user?.isAdmin ? window.location.href = "/gerenciar-avisos" : null
              }>
                Ver todos os {activeNewsItems.length} avisos
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
