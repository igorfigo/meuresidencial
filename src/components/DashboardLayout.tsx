import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  LogOut, 
  Menu, 
  Building2,
  ChevronDown,
  Package,
  Users,
  PiggyBank,
  BarChart,
  CreditCard,
  FileText,
  Receipt,
  FileIcon,
  CalendarDays,
  Briefcase,
  Bug,
  MessageSquare,
  KeyRound,
  Mail,
  Settings,
  Megaphone,
  ReceiptText,
  QrCode,
  CreditCard as PaymentIcon,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/use-notifications';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  submenu?: MenuItem[];
  badge?: number;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, switchCondominium } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const { unreadAnnouncements, unreadDocuments, markAsViewed } = useNotifications();

  const isFinanceiroPath = location.pathname.includes('/financeiro');

  useEffect(() => {
    if (isFinanceiroPath && !user?.isAdmin) {
      setExpandedSubmenu('Financeiro');
    }
    
    // Mark items as viewed when navigating to their respective pages
    if (location.pathname === '/comunicados') {
      markAsViewed('announcements');
    } else if (location.pathname === '/documentos') {
      markAsViewed('documents');
    }
  }, [location.pathname, isFinanceiroPath, user?.isAdmin, markAsViewed]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const toggleSubmenu = (name: string) => {
    setExpandedSubmenu(expandedSubmenu === name ? null : name);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCondominiumChange = (matricula: string) => {
    switchCondominium(matricula);
  };

  const adminMenuItems: MenuItem[] = [
    { name: 'Visão Geral', icon: <Home className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Cadastro Gestor', icon: <Building className="h-5 w-5" />, path: '/cadastro-gestor' },
    { name: 'Cadastro Planos', icon: <Package className="h-5 w-5" />, path: '/cadastro-planos' },
    { name: 'Chave PIX / Juros', icon: <KeyRound className="h-5 w-5" />, path: '/cadastro-chave-pix' },
    { name: 'Gerenciar Avisos', icon: <Megaphone className="h-5 w-5" />, path: '/gerenciar-avisos' },
    { 
      name: 'Business Management', 
      icon: <Briefcase className="h-5 w-5" />, 
      path: '/business-management',
      submenu: [
        { name: 'Despesas da Empresa', icon: <Receipt className="h-5 w-5" />, path: '/business-management/despesas' },
        { name: 'Contratos', icon: <FileText className="h-5 w-5" />, path: '/business-management/contratos' },
        { name: 'Documentos', icon: <FileIcon className="h-5 w-5" />, path: '/business-management/documentos' },
      ] 
    },
  ];

  const managerMenuItems: MenuItem[] = [
    { name: 'Visão Geral', icon: <Home className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Moradores', icon: <Users className="h-5 w-5" />, path: '/moradores' },
    { name: 'Comunicados', icon: <MessageSquare className="h-5 w-5" />, path: '/comunicados' },
    { name: 'Documentos Úteis', icon: <FileIcon className="h-5 w-5" />, path: '/documentos' },
    { 
      name: 'Financeiro', 
      icon: <PiggyBank className="h-5 w-5" />, 
      path: '/financeiro',
      submenu: [
        { name: 'Gráficos', icon: <BarChart className="h-5 w-5" />, path: '/financeiro/dashboard' },
        { name: 'Receitas/Despesas', icon: <Receipt className="h-5 w-5" />, path: '/financeiro/receitas-despesas' },
        { name: 'Recebimento PIX', icon: <QrCode className="h-5 w-5" />, path: '/financeiro/recebimento-pix' },
        { name: 'Prestação de Contas', icon: <FileText className="h-5 w-5" />, path: '/financeiro/prestacao-contas' },
      ] 
    },
    { name: 'Áreas Comuns', icon: <CalendarDays className="h-5 w-5" />, path: '/areas-comuns' },
    { name: 'Dedetizações', icon: <Bug className="h-5 w-5" />, path: '/dedetizacoes' },
    { name: 'Serviços Gerais', icon: <Briefcase className="h-5 w-5" />, path: '/servicos' },
    { name: 'Minha Assinatura', icon: <KeyRound className="h-5 w-5" />, path: '/minha-assinatura' },
    { name: 'Fale Conosco', icon: <Mail className="h-5 w-5" />, path: '/contato' },
  ];
  
  const residentMenuItems: MenuItem[] = [
    { name: 'Visão Geral', icon: <Home className="h-5 w-5" />, path: '/dashboard' },
    { 
      name: 'Comunicados', 
      icon: <MessageSquare className="h-5 w-5" />, 
      path: '/comunicados',
      badge: unreadAnnouncements > 0 ? unreadAnnouncements : undefined
    },
    { 
      name: 'Documentos Úteis', 
      icon: <FileIcon className="h-5 w-5" />, 
      path: '/documentos',
      badge: unreadDocuments > 0 ? unreadDocuments : undefined
    },
    { name: 'Áreas Comuns', icon: <CalendarDays className="h-5 w-5" />, path: '/areas-comuns' },
    { name: 'Serviços Gerais', icon: <Briefcase className="h-5 w-5" />, path: '/servicos' },
    { name: 'Minhas Cobranças', icon: <PaymentIcon className="h-5 w-5" />, path: '/minhas-cobrancas' },
  ];

  let menuItems: MenuItem[] = [];
  if (user?.isAdmin) {
    menuItems = adminMenuItems;
  } else if (user?.isResident) {
    menuItems = residentMenuItems;
  } else {
    menuItems = managerMenuItems;
  }

  const renderCondominiumSelector = () => {
    if (!user || user.isAdmin || user.isResident || !user.condominiums || user.condominiums.length <= 1) {
      return null;
    }

    return (
      <div className="px-3 py-2 mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between border-dashed border-slate-400 bg-slate-50"
            >
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-slate-500" />
                <span className="truncate max-w-[140px]">
                  {user.nomeCondominio || 'Selecione um condomínio'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 ml-2 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            {user.condominiums.map((condo) => (
              <DropdownMenuItem 
                key={condo.matricula}
                className={cn(
                  "cursor-pointer", 
                  condo.matricula === user.selectedCondominium && "bg-slate-100 font-medium"
                )}
                onClick={() => handleCondominiumChange(condo.matricula)}
              >
                <Building2 className="h-4 w-4 mr-2" />
                <span className="truncate">{condo.nomeCondominio}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuExpanded = expandedSubmenu === item.name;
    
    const isSubmenuActive = hasSubmenu && item.submenu?.some(subItem => 
      location.pathname === subItem.path
    );

    return (
      <div key={item.path} className="w-full">
        {hasSubmenu ? (
          <>
            <button
              onClick={() => toggleSubmenu(item.name)}
              className={cn(
                "flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                "text-sidebar-foreground hover:bg-sidebar-accent/50",
                (isSubmenuExpanded || isSubmenuActive) && "bg-sidebar-accent/70"
              )}
            >
              {item.icon}
              {(sidebarOpen || mobileMenuOpen) && (
                <>
                  <span className="ml-3 flex-1 text-left">{item.name}</span>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform", 
                    isSubmenuExpanded && "transform rotate-90"
                  )} />
                </>
              )}
            </button>
            {isSubmenuExpanded && (sidebarOpen || mobileMenuOpen) && (
              <div className="ml-4 pl-2 border-l border-sidebar-border space-y-1 mt-1">
                {item.submenu?.map(subItem => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-white"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {subItem.icon}
                    <span className="ml-3">{subItem.name}</span>
                    {subItem.badge && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto px-1.5 py-0.5 min-w-5 text-center bg-red-500"
                      >
                        {subItem.badge}
                      </Badge>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.icon}
            <span className={cn("ml-3", !sidebarOpen && "lg:hidden")}>{item.name}</span>
            {item.badge && (sidebarOpen || mobileMenuOpen) && (
              <Badge 
                variant="destructive" 
                className="ml-auto px-1.5 py-0.5 min-w-5 text-center bg-red-500"
              >
                {item.badge}
              </Badge>
            )}
          </NavLink>
        )}
      </div>
    );
  };

  const renderCurrentCondominium = () => {
    if (!user || user.isAdmin) return null;
    
    return (
      <div className="px-4 py-3 mb-3 border-l-4 border-brand-400 bg-sidebar-accent/20 rounded-md">
        <div className="flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-brand-400" />
          <span className="text-sm font-medium text-white truncate">
            {user.nomeCondominio || 'Condomínio'}
            {user.isResident && user.unit && ` - Unidade ${user.unit}`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-blue-50">
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-700"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-300 ease-in-out transform",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-white" />
            <span className="text-white font-display text-xl">MeuResidencial</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {!user?.isAdmin && (
          <div className="px-3 pt-3">
            {renderCurrentCondominium()}
          </div>
        )}

        {!user?.isAdmin && !user?.isResident && (
          <div className="px-3 py-2">
            {renderCondominiumSelector()}
          </div>
        )}

        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => renderMenuItem(item))}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-white">
              {user?.nome?.charAt(0) || 'U'}
            </div>
            <NavLink to="/perfil" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <p className="text-sm font-medium text-white truncate">
                {user?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-gray-300 truncate">
                {user?.email || 'email@example.com'}
              </p>
            </NavLink>
            <NavLink to="/perfil" className="text-white/70 hover:text-white transition-colors">
              <Settings className="h-4 w-4" />
            </NavLink>
          </div>
          <Button
            variant="ghost"
            className="w-full mt-3 text-sidebar-foreground hover:bg-sidebar-accent flex items-center justify-center"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-sidebar-border bg-sidebar",
          sidebarOpen ? "justify-between" : "justify-center"
        )}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center">
                <Building className="h-6 w-6 text-white" />
                <span className="ml-2 font-display text-white text-xl">MeuResidencial</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={toggleSidebar}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={toggleSidebar}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {sidebarOpen && !user?.isAdmin && (
          <div className="bg-sidebar px-3 pt-3">
            {renderCurrentCondominium()}
          </div>
        )}
        
        {sidebarOpen && !user?.isAdmin && !user?.isResident && (
          <div className="bg-sidebar px-3 py-2">
            {renderCondominiumSelector()}
          </div>
        )}
        
        <div className="flex-1 bg-sidebar overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map(item => {
            if (!sidebarOpen && item.submenu && item.submenu.length > 0) {
              return (
                <div 
                  key={item.path}
                  className="flex justify-center p-2 rounded-md cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent/50"
                  title={item.name}
                >
                  {item.icon}
                </div>
              );
            }
            return renderMenuItem(item);
          })}
        </div>
        
        <div className={cn(
          "p-4 border-t border-sidebar-border bg-sidebar",
          !sidebarOpen && "flex flex-col items-center"
        )}>
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <NavLink to="/perfil" className="flex-grow flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-white">
                  {user?.nome?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate max-w-[140px]">
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-300 truncate max-w-[140px]">
                    {user?.email || 'email@example.com'}
                  </p>
                </div>
              </NavLink>
              <NavLink to="/perfil" className="text-white/70 hover:text-white transition-colors" title="Perfil">
                <Settings className="h-4 w-4" />
              </NavLink>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <NavLink to="/perfil" title="Meu Perfil">
                <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-white mb-2">
                  {user?.nome?.charAt(0) || 'U'}
                </div>
              </NavLink>
              <NavLink to="/perfil" className="text-white/70 hover:text-white transition-colors" title="Configurações">
                <Settings className="h-4 w-4" />
              </NavLink>
            </div>
          )}
          
          <Button
            variant="ghost"
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent",
              sidebarOpen ? "w-full mt-3" : "p-2 min-w-0 min-h-0 h-auto mt-1"
            )}
            onClick={handleLogout}
            title={sidebarOpen ? undefined : "Sair"}
          >
            <LogOut className={cn("h-4 w-4", sidebarOpen && "mr-2")} />
            {sidebarOpen && "Sair"}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
