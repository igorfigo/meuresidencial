
import {
  Home,
  LayoutDashboard,
  Settings,
  User,
  UserPlus,
  Users,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  Bell,
  Truck,
  Megaphone,
  Receipt,
  ReceiptText,
  PiggyBank,
  BarChart,
  KeyRound,
  MessageSquare,
  FileIcon,
  CalendarDays,
  Bug,
  Mail,
  QrCode,
  Briefcase,
  DollarSign,
  MessagesSquare,
  Car,
  Receipt as ReceiptIcon,
  BarChart3,
  PieChart,
  History,
  Files,
  Server
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Skeleton } from './skeleton';
import { SwitchCondominium } from './switch-condominium';
import { Badge } from './badge';
import { useNotifications } from '@/hooks/use-notifications';
import { Separator } from './separator';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  submenu?: MenuItem[];
  badge?: number;
  isSeparator?: boolean;
}

export function Sidebar() {
  const { user, logout, isAuthenticated, switchCondominium } = useApp();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const { unreadAnnouncements, unreadDocuments, markAsViewed } = useNotifications();

  useEffect(() => {
    setIsMenuOpen(false);
    
    if (location.pathname === '/comunicados') {
      markAsViewed('announcements');
    } else if (location.pathname === '/documentos') {
      markAsViewed('documents');
    }

    // Check if we're on a business management page and expand the menu
    if (location.pathname === '/business-management' || 
        location.pathname === '/contratos' || 
        location.pathname === '/despesas-empresariais' ||
        location.pathname === '/vps-overview') {
      setExpandedSubmenu('Business Management');
    }
  }, [location.pathname, markAsViewed]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSubmenu = (label: string) => {
    setExpandedSubmenu(expandedSubmenu === label ? null : label);
  };

  const adminMenuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Visão Geral', icon: <Home className="h-5 w-5" /> },
    { path: '/cadastro-gestor', label: 'Cadastro Gestor', icon: <UserPlus className="h-5 w-5" /> },
    { path: '/cadastro-planos', label: 'Cadastro Planos', icon: <ClipboardCheck className="h-5 w-5" /> },
    { path: '/cadastro-chave-pix', label: 'Chave PIX / Juros', icon: <KeyRound className="h-5 w-5" /> },
    { path: '/gerenciar-avisos', label: 'Gerenciar Avisos', icon: <Megaphone className="h-5 w-5" /> },
    { isSeparator: true, path: '', label: '', icon: null },
    { 
      path: '/business-management', 
      label: 'Business Management', 
      icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
      submenu: [
        { path: '/business-management', label: 'Visão Geral', icon: <PieChart className="h-5 w-5 text-blue-500" /> },
        { path: '/contratos', label: 'Business Contracts', icon: <Briefcase className="h-5 w-5 text-blue-500" /> },
        { path: '/business-documents', label: 'Business Documents', icon: <Files className="h-5 w-5 text-blue-500" /> },
        { path: '/despesas-empresariais', label: 'Business Expenses', icon: <DollarSign className="h-5 w-5 text-blue-500" /> },
        { path: '/vps-overview', label: 'VPS Overview', icon: <Server className="h-5 w-5 text-blue-500" /> }
      ]
    },
  ];
  
  const managerMenuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Visão Geral', icon: <Home className="h-5 w-5" /> },
    { path: '/moradores', label: 'Moradores', icon: <Users className="h-5 w-5" /> },
    { path: '/comunicados', label: 'Comunicados', icon: <MessageSquare className="h-5 w-5" /> },
    { path: '/documentos', label: 'Documentos Úteis', icon: <FileIcon className="h-5 w-5" /> },
    { 
      path: '/financeiro', 
      label: 'Financeiro', 
      icon: <PiggyBank className="h-5 w-5" />,
      submenu: [
        { path: '/financeiro/dashboard', label: 'Gráficos', icon: <BarChart className="h-5 w-5" /> },
        { path: '/financeiro/receitas-despesas', label: 'Receitas/Despesas', icon: <Receipt className="h-5 w-5" /> },
        { path: '/financeiro/recebimento-pix', label: 'Recebimento PIX', icon: <QrCode className="h-5 w-5" /> },
        { path: '/financeiro/prestacao-contas', label: 'Prestação de Contas', icon: <FileText className="h-5 w-5" /> },
      ] 
    },
    { path: '/areas-comuns', label: 'Áreas Comuns', icon: <CalendarDays className="h-5 w-5" /> },
    { path: '/dedetizacoes', label: 'Dedetizações', icon: <Bug className="h-5 w-5" /> },
    { path: '/dados-historicos', label: 'Dados Históricos', icon: <History className="h-5 w-5" /> },
    { path: '/minha-assinatura', label: 'Minha Assinatura', icon: <KeyRound className="h-5 w-5" /> },
    { path: '/contato', label: 'Fale Conosco', icon: <Mail className="h-5 w-5" /> },
  ];
  
  const residentMenuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Visão Geral', icon: <Home className="h-5 w-5" /> },
    { 
      path: '/comunicados', 
      label: 'Comunicados', 
      icon: <MessageSquare className="h-5 w-5" />,
      badge: unreadAnnouncements > 0 ? unreadAnnouncements : undefined
    },
    { 
      path: '/documentos', 
      label: 'Documentos Úteis', 
      icon: <FileIcon className="h-5 w-5" />,
      badge: unreadDocuments > 0 ? unreadDocuments : undefined
    },
    { path: '/areas-comuns', label: 'Áreas Comuns', icon: <CalendarDays className="h-5 w-5" /> },
    { path: '/minhas-cobrancas', label: 'Minhas Cobranças', icon: <Receipt className="h-5 w-5" /> },
    { path: '/garagem-livre', label: 'Garagem Livre', icon: <Car className="h-5 w-5" /> },
    { path: '/sugestao-reclamacao', label: 'Sugestão/Reclamação', icon: <MessagesSquare className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderMenuItems = () => {
    console.log("User in sidebar:", user);
    console.log("Is user admin?", user?.isAdmin);
    console.log("Is user resident?", user?.isResident);
    
    let menuItems = [];
    if (user?.isAdmin) {
      menuItems = adminMenuItems;
    } else if (user?.isResident) {
      menuItems = residentMenuItems;
    } else {
      menuItems = managerMenuItems;
    }

    return menuItems.map((item, index) => {
      if (item.isSeparator) {
        return <Separator key={`separator-${index}`} className="my-2 bg-gray-300 dark:bg-gray-600" />;
      }
      
      if (item.submenu) {
        const isExpanded = expandedSubmenu === item.label;
        const isActive = location.pathname === item.path || 
                        (item.submenu && item.submenu.some(subItem => location.pathname === subItem.path));
        
        return (
          <li key={item.label} className="mb-1">
            <div className="flex flex-col">
              <button
                onClick={() => toggleSubmenu(item.label)}
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                {item.icon}
                <span className="ml-3 flex-1 text-left">{item.label}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {isExpanded && (
                <ul className="pl-8 mt-1 space-y-1">
                  {item.submenu.map((subItem) => (
                    <li key={subItem.label}>
                      <a
                        href={subItem.path}
                        className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === subItem.path ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        {subItem.icon}
                        <span className="ml-3">{subItem.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      }
      
      return (
        <li key={item.label}>
          <a
            href={item.path}
            className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === item.path ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            {item.icon}
            <span className="ml-3">{item.label}</span>
            {item.badge && (
              <Badge 
                variant="destructive" 
                className="ml-auto mr-1 px-1.5 py-0.5 min-w-5 text-center"
              >
                {item.badge}
              </Badge>
            )}
          </a>
        </li>
      );
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 h-screen fixed top-0 left-0 z-50 shadow">
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <span className="text-lg font-semibold dark:text-white">
          Meu Residencial
        </span>
      </div>

      <div className="p-4">
        {user ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full text-left flex items-center space-x-2 group">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>{user.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none dark:text-white">{user.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.isAdmin ? 'Administrador' : user.nomeCondominio}
                    </p>
                  </div>
                  {!user.isResident && (
                    <Settings 
                      className="h-4 w-4 text-gray-400 opacity-70 group-hover:opacity-100 transition-opacity" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/perfil');
                      }}
                    />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!user.isResident && (
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!user.isAdmin && !user.isResident && user.condominiums && user.condominiums.length > 1 && (
              <SwitchCondominium
                condominiums={user.condominiums}
                selectedCondominium={user.selectedCondominium || ''}
                switchCondominium={switchCondominium}
              />
            )}
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          </div>
        )}
      </div>

      <nav className="py-4 px-6">
        <ul>
          {renderMenuItems()}
        </ul>
      </nav>
    </aside>
  );
}
