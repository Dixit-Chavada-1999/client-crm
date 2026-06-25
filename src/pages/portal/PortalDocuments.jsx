import { useState, useEffect } from 'react';
import {
    Files,
    Search,
    Download,
    Eye,
    Calendar,
    FileText,
    Image,
    File,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import { documentsService } from '../../services/customerPortalApi';
import useCustomerAuthStore from '../../store/customerAuthStore';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';

const typeIcons = {
    contract: FileText,
    proposal: FileText,
    report: FileText,
    design: Image,
    other: File,
};

const categoryColors = {
    contract: 'bg-purple-100 text-purple-700',
    proposal: 'bg-blue-100 text-blue-700',
    report: 'bg-green-100 text-green-700',
    design: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
};

export default function PortalDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);
    const [acknowledgingId, setAcknowledgingId] = useState(null);
    const { hasPermission } = useCustomerAuthStore();

    useEffect(() => {
        fetchDocuments();
    }, [categoryFilter]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const params = {};
            if (categoryFilter) params.category = categoryFilter;
            const response = await documentsService.getAll(params);
            setDocuments(response.data.documents || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (docId, fileName) => {
        if (!hasPermission('download_documents')) {
            return;
        }

        try {
            setDownloadingId(docId);
            const response = await documentsService.getDownloadUrl(docId);
            const { url } = response.data;

            // Open download URL in new tab
            window.open(url, '_blank');
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleAcknowledge = async (docId) => {
        try {
            setAcknowledgingId(docId);
            await documentsService.acknowledge(docId);
            // Update local state
            setDocuments(docs =>
                docs.map(doc =>
                    doc.id === docId
                        ? { ...doc, acknowledged_at: new Date().toISOString() }
                        : doc
                )
            );
        } catch (err) {
            console.error('Acknowledge error:', err);
        } finally {
            setAcknowledgingId(null);
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.title?.toLowerCase().includes(search.toLowerCase()) ||
        doc.file_name?.toLowerCase().includes(search.toLowerCase())
    );

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    return (
        <PortalLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                <p className="text-gray-500 mt-1">Access your shared documents</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Categories</option>
                        <option value="contract">Contracts</option>
                        <option value="proposal">Proposals</option>
                        <option value="report">Reports</option>
                        <option value="design">Designs</option>
                        <option value="other">Other</option>
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
            ) : filteredDocuments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Files className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                    <p className="text-gray-500 mt-1">
                        {search || categoryFilter ? 'Try adjusting your filters' : 'No documents have been shared with you'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="divide-y">
                        {filteredDocuments.map((doc) => {
                            const TypeIcon = typeIcons[doc.category] || File;

                            return (
                                <div
                                    key={doc.id}
                                    className="p-5 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`p-3 rounded-lg ${
                                                categoryColors[doc.category] || 'bg-gray-100'
                                            }`}>
                                                <TypeIcon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {doc.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {doc.file_name}
                                                </p>
                                                {doc.description && (
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                        {doc.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {new Date(doc.created_at).toLocaleDateString()}
                                                    </span>
                                                    {doc.file_size && (
                                                        <span>{formatFileSize(doc.file_size)}</span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded-full ${
                                                        categoryColors[doc.category] || 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {doc.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {doc.requires_acknowledgment && !doc.acknowledged_at && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAcknowledge(doc.id)}
                                                    loading={acknowledgingId === doc.id}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Acknowledge
                                                </Button>
                                            )}
                                            {doc.acknowledged_at && (
                                                <span className="text-xs text-green-600 flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Acknowledged
                                                </span>
                                            )}
                                            {hasPermission('download_documents') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(doc.id, doc.file_name)}
                                                    loading={downloadingId === doc.id}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
