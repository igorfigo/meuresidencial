
import React from 'react';
import { Link } from 'react-router-dom';
import { useSidebarNavigation } from '@/hooks/use-sidebar-navigation';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { cn } from '@/lib/utils';

const SidebarNavigation = () => {
  const navigationItems = useSidebarNavigation();

  return (
    <nav className="space-y-1 px-2 py-3">
      {navigationItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            "flex items-center justify-between py-2 px-4 my-1 text-sm font-medium rounded-md",
            item.active
              ? "bg-gray-100 text-brand-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <div className="flex items-center">
            <item.icon className="mr-3 h-5 w-5" />
            <span>{item.name}</span>
          </div>
          {item.notifications > 0 && (
            <NotificationBadge count={item.notifications} />
          )}
        </Link>
      ))}
    </nav>
  );
};

export default SidebarNavigation;
