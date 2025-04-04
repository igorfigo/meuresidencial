
import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLocation } from 'react-router-dom';
import { useNotifications } from './use-notifications';
import { 
  Home, 
  UserRound, 
  FileText, 
  MessageSquare,
  Car,
  CalendarClock,
  Building,
  Bell,
  BadgeDollarSign
} from 'lucide-react';

export const useSidebarNavigation = () => {
  const { user } = useApp();
  const location = useLocation();
  const {
    unreadAnnouncements,
    unreadDocuments,
    unreadGarageListings
  } = useNotifications();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isResident = user?.isResident === true;
  const isAdmin = user?.isAdmin === true;
  const isManager = !isResident && !isAdmin && user !== null;

  const navigation = useMemo(() => {
    if (isAdmin) {
      return [
        { 
          name: "Dashboard", 
          href: "/admin-dashboard", 
          icon: Home, 
          active: isActive("/admin-dashboard") 
        },
        // Admin navigation items
      ];
    }

    if (isManager) {
      return [
        { 
          name: "Dashboard", 
          href: "/dashboard", 
          icon: Home, 
          active: isActive("/dashboard") 
        },
        { 
          name: "Moradores", 
          href: "/moradores", 
          icon: UserRound, 
          active: isActive("/moradores") 
        },
        { 
          name: "Documentos", 
          href: "/documentos", 
          icon: FileText, 
          active: isActive("/documentos") 
        },
        { 
          name: "Comunicados", 
          href: "/comunicados", 
          icon: Bell, 
          active: isActive("/comunicados") 
        },
        { 
          name: "Áreas Comuns", 
          href: "/areas-comuns", 
          icon: Building, 
          active: isActive("/areas-comuns") 
        },
        { 
          name: "Vagas de Garagem", 
          href: "/vaga-garagem", 
          icon: Car, 
          active: isActive("/vaga-garagem"),
          notifications: unreadGarageListings
        }
      ];
    }

    // Default resident navigation
    return [
      { 
        name: "Dashboard", 
        href: "/dashboard", 
        icon: Home, 
        active: isActive("/dashboard") 
      },
      { 
        name: "Documentos", 
        href: "/documentos", 
        icon: FileText, 
        active: isActive("/documentos"),
        notifications: unreadDocuments
      },
      { 
        name: "Comunicados", 
        href: "/comunicados", 
        icon: Bell, 
        active: isActive("/comunicados"),
        notifications: unreadAnnouncements
      },
      { 
        name: "Áreas Comuns", 
        href: "/areas-comuns", 
        icon: Building, 
        active: isActive("/areas-comuns") 
      },
      { 
        name: "Garagem Livre", 
        href: "/garagem-livre", 
        icon: Car, 
        active: isActive("/garagem-livre"),
        notifications: unreadGarageListings
      },
      { 
        name: "Minhas Cobranças", 
        href: "/minhas-cobrancas", 
        icon: BadgeDollarSign, 
        active: isActive("/minhas-cobrancas") 
      }
    ];
  }, [
    isAdmin, 
    isManager, 
    isActive, 
    unreadAnnouncements, 
    unreadDocuments, 
    unreadGarageListings
  ]);

  return navigation;
};
