import { NavLink } from 'react-router-dom';

import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Link as LinkIcon, 
  BarChart2, 
  Settings,
  BookOpen,
  Command,
  X,
  Timer as TimerIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Day Planner', path: '/planner', icon: Calendar },
  { name: 'Todo Lists', path: '/todos', icon: CheckSquare },
  { name: 'Link Vault', path: '/links', icon: LinkIcon },
  { name: 'Focus Timer', path: '/timer', icon: TimerIcon },
  { name: 'Notes', path: '/notes', icon: BookOpen },
  { name: 'Statistics', path: '/statistics', icon: BarChart2 },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const user = useAuthStore((state) => state.user);

  // Close sidebar on route change for mobile
  const handleNavClick = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-bg-app border-r border-border-subtle flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="h-16 flex items-center px-6 border-b border-border-subtle">
        <h1 className="text-xl font-bold tracking-tight text-text-main flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center shadow-lg shadow-accent/20">
            <Command className="w-5 h-5 text-bg-app" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            WORKBENCH
          </span>
        </h1>
        {setIsMobileOpen && (
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto p-2 text-text-muted hover:text-text-main md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                isActive 
                  ? "bg-bg-card text-text-main" 
                  : "text-text-muted hover:bg-bg-card hover:text-text-main"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-text-muted mb-2">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name || 'User'} className="w-8 h-8 rounded-full border border-border-subtle" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center border border-border-subtle uppercase">
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </div>
          )}
          <div className="overflow-hidden flex-1">
            <p className="font-medium text-text-main truncate">{user?.name || 'User'}</p>
            <p className="text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <NavLink
          to="/settings"
          onClick={handleNavClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 mt-2 rounded-md text-sm font-medium transition-colors duration-200",
              isActive 
                ? "bg-bg-card text-text-main" 
                : "text-text-muted hover:bg-bg-card hover:text-text-main"
            )
          }
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
      </div>
    </aside>
    </>
  );
}
