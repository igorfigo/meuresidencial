
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, FileIcon, CalendarDays, Receipt, Car, MessagesSquare } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { Badge } from '@/components/ui/badge';

export const ResidentMobileMenu = () => {
  const { unreadAnnouncements, unreadDocuments } = useNotifications();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Visão Geral',
      icon: <div className="h-6 w-6 flex items-center justify-center bg-blue-100 rounded-md text-blue-600">D</div>,
    },
    {
      path: '/comunicados',
      label: 'Comunicados',
      icon: <MessageSquare className="h-5 w-5 text-indigo-600" />,
      badge: unreadAnnouncements > 0 ? unreadAnnouncements : undefined,
    },
    {
      path: '/documentos',
      label: 'Documentos',
      icon: <FileIcon className="h-5 w-5 text-green-600" />,
      badge: unreadDocuments > 0 ? unreadDocuments : undefined,
    },
    {
      path: '/areas-comuns',
      label: 'Áreas Comuns',
      icon: <CalendarDays className="h-5 w-5 text-amber-600" />,
    },
    {
      path: '/minhas-cobrancas',
      label: 'Cobranças',
      icon: <Receipt className="h-5 w-5 text-purple-600" />,
    },
    {
      path: '/garagem-livre',
      label: 'Garagem',
      icon: <Car className="h-5 w-5 text-blue-600" />,
    },
    {
      path: '/sugestao-reclamacao',
      label: 'Sugestão/Reclamação',
      icon: <MessagesSquare className="h-5 w-5 text-red-600" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {menuItems.map((item) => (
        <NavLink key={item.path} to={item.path}>
          {({ isActive }) => (
            <Card className={`border-t-4 ${isActive ? 'border-t-brand-600' : 'border-t-gray-200'} shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full`}>
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <div className="relative mb-1">
                  {item.icon}
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium mt-1 line-clamp-1">{item.label}</span>
              </CardContent>
            </Card>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default ResidentMobileMenu;
