import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Bell, 
  BookOpen, 
  LayoutGrid, 
  Calendar, 
  Bug, 
  FileText, 
  Menu, 
  X,
  LogOut,
  Building2,
  UserPlus,
  Settings,
  PieChart,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const location = useLocation();
  const { isMobile } = useMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-background border-b h-[60px] z-30">
        <div className="flex items-center justify-between h-full px-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle Menu</span>
              </Button>
            )}
            <h1 className="text-lg font-semibold ml-2">Meu Residencial</h1>
          </div>

          {/* User Info and Logout */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm">{user?.nome}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content area */}
      <div className="flex flex-1">
        {/* Sidebar navigation */}
        <aside className={cn(
          "fixed left-0 top-[60px] z-20 h-[calc(100vh-60px)] w-64 border-r bg-background transition-transform lg:static lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <nav className="grid gap-1 p-4">
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                location.pathname === "/dashboard"
                  ? "bg-muted"
                  : "hover:bg-muted"
              )}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/moradores"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                location.pathname === "/moradores"
                  ? "bg-muted"
                  : "hover:bg-muted"
              )}
            >
              <Users className="h-5 w-5" />
              <span>Moradores</span>
            </Link>
            <Link
              to="/comunicados"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                location.pathname === "/comunicados"
                  ? "bg-muted"
                  : "hover:bg-muted"
              )}
            >
              <Bell className="h-5 w-5" />
              <span>Comunicados</span>
            </Link>
            <Link
              to="/areas-comuns"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                location.pathname === "/areas-comuns"
                  ? "bg-muted"
                  : "hover:bg-muted"
              )}
            >
              <LayoutGrid className="h-5 w-5" />
              <span>Áreas Comuns</span>
            </Link>
            <Link
              to="/documentos"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                location.pathname === "/documentos"
                  ? "bg-muted"
                  : "hover:bg-muted"
              )}
            >
              <FileText className="h-5 w-5" />
              <span>Documentos</span>
            </Link>
            <Link
              to="/dedetizacoes"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                location.pathname === "/dedetizacoes"
                  ? "bg-muted"
                  : "hover:bg-muted"
              )}
            >
              <Bug className="h-5 w-5" />
              <span>Dedetizações</span>
            </Link>
            
            {/* Add Fale Conosco menu item */}
            <Link
              to="/fale-conosco"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                location.pathname === "/fale-conosco"
                  ? "bg-muted"
                  : "hover:bg-muted"
              )}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Fale Conosco</span>
            </Link>
            
            {user?.isAdmin && (
              <>
                <Link
                  to="/cadastro-gestor"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    location.pathname === "/cadastro-gestor"
                      ? "bg-muted"
                      : "hover:bg-muted"
                  )}
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Cadastrar Gestor</span>
                </Link>
                <Link
                  to="/cadastro-planos"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    location.pathname === "/cadastro-planos"
                      ? "bg-muted"
                      : "hover:bg-muted"
                  )}
                >
                  <PieChart className="h-5 w-5" />
                  <span>Cadastrar Planos</span>
                </Link>
              </>
            )}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 mt-[60px] lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
