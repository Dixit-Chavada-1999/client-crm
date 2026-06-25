import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText,
    Search,
    Calendar,
    DollarSign,
    AlertCircle,
    ChevronRight,
    Clock
} from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import { quotationsService } from '../../services/customerPortalApi';
import Spinner from '../../components/common/Spinner';

const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-500',
};

export default function PortalQuotations() {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchQuotations();
    }, [statusFilter]);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const response = await quotationsService.getAll(params);
            setQuotations(response.data.quotations || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load quotations');
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotations = quotations.filter(quotation =>
        quotation.title?.toLowerCase().includes(search.toLowerCase()) ||
        quotation.quotation_number?.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    return (
        <PortalLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
                <p className="text-gray-500 mt-1">Review and respond to quotations</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search quotations..."
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
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
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
            ) : filteredQuotations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No quotations found</h3>
                    <p className="text-gray-500 mt-1">
                        {search || statusFilter ? 'Try adjusting your filters' : 'You have no quotations'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredQuotations.map((quotation) => (
                        <Link
                            key={quotation.id}
                            to={`/portal/quotations/${quotation.id}`}
                            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-gray-900">
                                            {quotation.quotation_number}
                                        </h3>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                            statusColors[quotation.status] || 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {quotation.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mt-1">{quotation.title}</p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(quotation.created_at).toLocaleDateString()}
                                        </span>
                                        {quotation.valid_until && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                Valid until: {new Date(quotation.valid_until).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatCurrency(quotation.total_amount)}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </PortalLayout>
    );
}
