import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Receipt,
    Search,
    Calendar,
    AlertCircle,
    ChevronRight,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import { invoicesService } from '../../services/customerPortalApi';
import Spinner from '../../components/common/Spinner';

const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
};

const statusIcons = {
    paid: CheckCircle,
    overdue: AlertTriangle,
    sent: Clock,
    partial: Clock,
};

export default function PortalInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const response = await invoicesService.getAll(params);
            setInvoices(response.data.invoices || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoice_number?.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const isOverdue = (dueDate, status) => {
        if (status === 'paid' || status === 'cancelled') return false;
        return new Date(dueDate) < new Date();
    };

    return (
        <PortalLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                <p className="text-gray-500 mt-1">View and track your invoices</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                </div>
            ) : filteredInvoices.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
                    <p className="text-gray-500 mt-1">
                        {search || statusFilter ? 'Try adjusting your filters' : 'You have no invoices'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredInvoices.map((invoice) => {
                        const overdue = isOverdue(invoice.due_date, invoice.status);
                        const StatusIcon = statusIcons[overdue ? 'overdue' : invoice.status];

                        return (
                            <Link
                                key={invoice.id}
                                to={`/portal/invoices/${invoice.id}`}
                                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-gray-900">
                                                {invoice.invoice_number}
                                            </h3>
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                                overdue
                                                    ? statusColors.overdue
                                                    : statusColors[invoice.status] || 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {overdue ? 'Overdue' : invoice.status}
                                            </span>
                                        </div>
                                        {invoice.project?.name && (
                                            <p className="text-gray-600 mt-1">
                                                Project: {invoice.project.name}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Issued: {new Date(invoice.issue_date).toLocaleDateString()}
                                            </span>
                                            <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
                                                <Clock className="h-4 w-4" />
                                                Due: {new Date(invoice.due_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">
                                                {formatCurrency(invoice.total_amount)}
                                            </p>
                                            {invoice.paid_amount > 0 && invoice.paid_amount < invoice.total_amount && (
                                                <p className="text-sm text-green-600">
                                                    Paid: {formatCurrency(invoice.paid_amount)}
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </PortalLayout>
    );
}
