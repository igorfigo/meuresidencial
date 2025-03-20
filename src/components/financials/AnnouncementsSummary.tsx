
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { MessagesSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AnnouncementsSummary = () => {
  const { user } = useApp();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!user?.selectedCondominium) return;
      
      setLoading(true);
      try {
        // Using type assertion to bypass TypeScript checking
        const { data, error } = await (supabase
          .from('announcements' as any)
          .select('*')
          .eq('matricula', user.selectedCondominium)
          .order('created_at', { ascending: false })
          .limit(5) as any);
        
        if (error) throw error;
        
        setAnnouncements(data || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, [user?.selectedCondominium]);
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Comunicados Recentes</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <MessagesSquare className="h-3 w-3" />
            <span>{announcements.length} comunicados</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <p className="text-sm text-gray-500">Carregando dados...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <MessagesSquare className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Nenhum comunicado encontrado</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.location.href = '/comunicados'}
                >
                  Criar Comunicado
                </Button>
              </div>
            ) : (
              announcements.map((announcement, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium line-clamp-1">{announcement.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(announcement.created_at)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{announcement.content}</p>
                </div>
              ))
            )}
            
            {announcements.length > 0 && (
              <div className="text-center mt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/comunicados'}
                >
                  Ver Todos os Comunicados
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
