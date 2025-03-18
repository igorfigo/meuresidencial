
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Trash } from 'lucide-react';
import { Announcement } from '@/hooks/use-announcements';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnnouncementCardProps {
  announcement: Announcement;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onView,
  onDelete
}) => {
  const { id, title, content, created_at } = announcement;
  
  // Format date
  const formattedDate = created_at 
    ? formatDistanceToNow(new Date(created_at), { 
        addSuffix: true, 
        locale: ptBR 
      })
    : '';
  
  // Extract preview from content (first 100 characters)
  const contentPreview = content.length > 100
    ? `${content.substring(0, 100).trim()}...`
    : content;

  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold truncate">{title}</CardTitle>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm whitespace-pre-line line-clamp-4">{contentPreview}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => id && onView(id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Visualizar
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          onClick={() => id && onDelete(id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementCard;
