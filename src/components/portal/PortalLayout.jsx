import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    Receipt,
    Files,
    User,
    LogOut,
    Menu,
    X,
    Building2
} from 'lucide-react';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { authService } from '../../services/customerPortalApi';

const navigation = [
    { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
    { name: 'Projects', href: '/portal/projects', icon: FolderKanban, permission: 'view_projects' },
    { name: 'Quotations', href: '/portal/quotations', icon: FileText, permission: 'view_quotations' },
    { name: 'Invoices', href: '/portal/invoices', icon: Receipt, permission: 'view_invoices' },
    { name: 'Documents', href: '/portal/documents', icon: Files, permission: 'view_documents' },
];

export default function PortalLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, hasPermission, refreshToken } = useCustomerAuthStore();

    const handleLogout = async () => {
        try {
            await authService.logout(refreshToken);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logout();
            navigate('/portal/login');
        }
    };

    const filteredNavigation = navigation.filter(item => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
    });

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:z-auto
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-4 border-b">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-8 w-8 text-blue-600" />
                            <span className="font-bold text-lg">Client Portal</span>
                        </div>
                        <button
                            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Company info */}
                    <div className="px-4 py-3 border-b bg-gray-50">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.company_name || 'Company'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                        {filteredNavigation.map((item) => {
                            const isActive = location.pathname === item.href ||
                                (item.href !== '/portal' && location.pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User menu */}
                    <div className="border-t p-2">
                        <Link
                            to="/portal/profile"
                            onClick={() => setSidebarOpen(false)}
                            className={`
                                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                ${location.pathname === '/portal/profile'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
                            `}
                        >
                            <User className="h-5 w-5" />
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b shadow-sm lg:hidden">
                    <button
                        className="p-2 rounded-md hover:bg-gray-100"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="ml-4 flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <span className="font-bold">Client Portal</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
