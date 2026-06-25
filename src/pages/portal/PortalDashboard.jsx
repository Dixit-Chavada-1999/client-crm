import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FolderKanban,
    FileText,
    Receipt,
    Files,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import { dashboardService } from '../../services/customerPortalApi';
import useCustomerAuthStore from '../../store/customerAuthStore';
import Spinner from '../../components/common/Spinner';

export default function PortalDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, hasPermission } = useCustomerAuthStore();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await dashboardService.getDashboard();
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PortalLayout>
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            </PortalLayout>
        );
    }

    if (error) {
        return (
            <PortalLayout>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                    <button
                        onClick={fetchDashboard}
                        className="ml-auto text-red-600 hover:underline flex items-center gap-1"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </button>
                </div>
            </PortalLayout>
        );
    }

    const stats = [
        {
            name: 'Active Projects',
            value: data?.projects?.active || 0,
            icon: FolderKanban,
            color: 'bg-blue-500',
            href: '/portal/projects',
            permission: 'view_projects',
        },
        {
            name: 'Pending Quotations',
            value: data?.quotations?.pending || 0,
            icon: FileText,
            color: 'bg-amber-500',
            href: '/portal/quotations',
            permission: 'view_quotations',
        },
        {
            name: 'Unpaid Invoices',
            value: data?.invoices?.unpaid || 0,
            icon: Receipt,
            color: 'bg-red-500',
            href: '/portal/invoices',
            permission: 'view_invoices',
        },
        {
            name: 'Documents',
            value: data?.documents?.total || 0,
            icon: Files,
            color: 'bg-green-500',
            href: '/portal/documents',
            permission: 'view_documents',
        },
    ];

    const filteredStats = stats.filter(stat => hasPermission(stat.permission));

    return (
        <PortalLayout>
            {/* Welcome header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.first_name || 'User'}
                </h1>
                <p className="text-gray-500 mt-1">
                    Here's an overview of your account activity
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {filteredStats.map((stat) => (
                    <Link
                        key={stat.name}
                        to={stat.href}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.name}</p>
                    </Link>
                ))}
            </div>

            {/* Recent items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Quotations */}
                {hasPermission('view_quotations') && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-semibold text-gray-900">Recent Quotations</h2>
                            <Link
                                to="/portal/quotations"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="divide-y">
                            {data?.recentQuotations?.length > 0 ? (
                                data.recentQuotations.map((quotation) => (
                                    <Link
                                        key={quotation.id}
                                        to={`/portal/quotations/${quotation.id}`}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {quotation.quotation_number}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {quotation.title}
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                            quotation.status === 'pending'
                                                ? 'bg-amber-100 text-amber-700'
                                                : quotation.status === 'approved'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {quotation.status}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No recent quotations
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Invoices */}
                {hasPermission('view_invoices') && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
                            <Link
                                to="/portal/invoices"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="divide-y">
                            {data?.recentInvoices?.length > 0 ? (
                                data.recentInvoices.map((invoice) => (
                                    <Link
                                        key={invoice.id}
                                        to={`/portal/invoices/${invoice.id}`}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {invoice.invoice_number}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Due: {new Date(invoice.due_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                                ${invoice.total_amount?.toLocaleString()}
                                            </p>
                                            <span className={`text-xs font-medium ${
                                                invoice.status === 'paid'
                                                    ? 'text-green-600'
                                                    : invoice.status === 'overdue'
                                                    ? 'text-red-600'
                                                    : 'text-amber-600'
                                            }`}>
                                                {invoice.status}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No recent invoices
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
