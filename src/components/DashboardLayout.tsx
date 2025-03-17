
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  LogOut, 
  Menu, 
  Settings, 
  User,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Cadastro Gestor', icon: <Building className="h-5 w-5" />, path: '/cadastro-gestor' },
  ];

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-700"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
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

        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
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
              <span className="ml-3">{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-white">
              {user?.nome?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-gray-300 truncate">
                {user?.email || 'email@example.com'}
              </p>
            </div>
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

      {/* Sidebar for desktop */}
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
        
        <div className="flex-1 bg-sidebar overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md transition-colors",
                  sidebarOpen ? "px-3 py-2" : "p-2 justify-center",
                  isActive
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
              title={sidebarOpen ? undefined : item.name}
            >
              {item.icon}
              {sidebarOpen && <span className="ml-3 text-sm">{item.name}</span>}
            </NavLink>
          ))}
        </div>
        
        <div className={cn(
          "p-4 border-t border-sidebar-border bg-sidebar",
          !sidebarOpen && "flex flex-col items-center"
        )}>
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-white">
                {user?.nome?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-white truncate max-w-[140px]">
                  {user?.nome || 'Usuário'}
                </p>
                <p className="text-xs text-gray-300 truncate max-w-[140px]">
                  {user?.email || 'email@example.com'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-white mb-2">
              {user?.nome?.charAt(0) || 'U'}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
