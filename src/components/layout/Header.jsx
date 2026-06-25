import { Menu, Bell, Search } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

export default function Header() {
  const { toggleSidebar } = useUiStore();
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="hidden md:flex ml-4 lg:ml-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User avatar */}
        <div className="flex items-center">
          <Avatar
            firstName={user?.first_name}
            lastName={user?.last_name}
            src={user?.avatar_url}
            size="sm"
          />
          <span className="hidden lg:block ml-2 text-sm font-medium text-gray-700">
            {user?.first_name} {user?.last_name}
          </span>
        </div>
      </div>
    </header>
  );
}
