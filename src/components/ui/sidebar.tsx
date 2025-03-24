
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
  Briefcase,
  Receipt,
  ReceiptText
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

// Define interface for menu items with optional submenu
interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  submenu?: MenuItem[];
}

export function Sidebar() {
  const { user, logout, isAuthenticated, switchCondominium } = useApp();
  const isMobile = useIsMobile();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Close the menu when the route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const adminMenuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Visão Geral', icon: <Home className="h-5 w-5" /> },
    { path: '/cadastro-gestor', label: 'Cadastro Gestor', icon: <UserPlus className="h-5 w-5" /> },
    { path: '/cadastro-planos', label: 'Cadastro Planos', icon: <ClipboardCheck className="h-5 w-5" /> },
    { path: '/gerar-faturas', label: 'Gerar Faturas', icon: <ReceiptText className="h-5 w-5" /> },
    { path: '/gerenciar-avisos', label: 'Gerenciar Avisos', icon: <Megaphone className="h-5 w-5" /> },
    { 
      path: '/business-management', 
      label: 'Business Management', 
      icon: <Briefcase className="h-5 w-5" />,
      submenu: [
        { path: '/business-management/despesas', label: 'Despesas da Empresa', icon: <Receipt className="h-5 w-5" /> },
        { path: '/business-management/contratos', label: 'Contratos', icon: <FileText className="h-5 w-5" /> },
      ]
    },
  ];
  
  const managerMenuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Visão Geral', icon: <Home className="h-5 w-5" /> },
    { path: '/minha-assinatura', label: 'Minha Assinatura', icon: <CreditCard className="h-5 w-5" /> },
    { path: '/moradores', label: 'Moradores', icon: <Users className="h-5 w-5" /> },
    { path: '/areas-comuns', label: 'Áreas Comuns', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/comunicados', label: 'Comunicados', icon: <Bell className="h-5 w-5" /> },
    { path: '/documentos', label: 'Documentos', icon: <FileText className="h-5 w-5" /> },
    { path: '/dedetizacoes', label: 'Dedetizações', icon: <Truck className="h-5 w-5" /> },
  ];
  
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderMenuItems = () => {
    // Use isAdmin from user object to determine which menu items to show
    // Add console.log to help with debugging
    console.log("User in sidebar:", user);
    console.log("Is user admin?", user?.isAdmin);
    
    const menuItems = user?.isAdmin ? adminMenuItems : managerMenuItems;

    return menuItems.map((item) => {
      if (item.submenu) {
        return (
          <li key={item.label} className="mb-1">
            <div className="flex flex-col">
              <a
                href={item.path}
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === item.path ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </a>
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
                  <Settings 
                    className="h-4 w-4 text-gray-400 opacity-70 group-hover:opacity-100 transition-opacity" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/perfil');
                    }}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!user.isAdmin && user.condominiums && user.condominiums.length > 1 && (
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
