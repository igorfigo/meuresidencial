import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { SwitchCondominium } from './ui/switch-condominium';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, switchCondominium } = useApp();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <Sidebar />
        </div>
      )}

      {/* Mobile sidebar with sheet */}
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div>
            {/* Mobile menu button already handled above */}
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          {/* Condominium switcher for managers with multiple condominiums */}
          {user.condominiums && user.condominiums.length > 1 && (
            <div className="px-4 py-2">
              <SwitchCondominium
                condominiums={user.condominiums}
                selectedCondominium={user.selectedCondominium || ''}
                switchCondominium={switchCondominium}
              />
            </div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
