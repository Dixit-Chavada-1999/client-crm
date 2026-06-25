import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import useUiStore from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Customers', href: '/customers', icon: Building2 },
  { name: 'Profile', href: '/profile', icon: UserCircle },
];

const adminNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUiStore();
  const { user, logout, isAdmin } = useAuth();

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-gray-900 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          {!sidebarCollapsed && (
            <span className="ml-3 text-white font-semibold text-lg">CRM</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className={cn('w-5 h-5', !sidebarCollapsed && 'mr-3')} />
            {!sidebarCollapsed && item.name}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-800">
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase mb-2">
                  Admin
                </p>
              )}
              {adminNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )
                  }
                >
                  <item.icon className={cn('w-5 h-5', !sidebarCollapsed && 'mr-3')} />
                  {!sidebarCollapsed && item.name}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Collapse button */}
      <button
        onClick={toggleSidebarCollapse}
        className="flex items-center justify-center h-10 border-t border-gray-800 text-gray-400 hover:text-white"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {/* User section */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 text-sm font-medium">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
