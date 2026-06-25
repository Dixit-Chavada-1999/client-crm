import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Search, Eye, Mail, Phone, Globe, MapPin, Briefcase } from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Select from '../components/common/Select';
import { PageSpinner } from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { formatDate } from '../utils/formatters';

const CUSTOMER_STATUSES = {
  active: { label: 'Active', color: 'green' },
  inactive: { label: 'Inactive', color: 'gray' },
  suspended: { label: 'Suspended', color: 'red' },
};

export default function Customers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', { page, search, status }],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      const response = await api.get('/customers', { params });
      return response.data.data;
    },
  });

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  const handleFilterChange = (key, value) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    ...Object.entries(CUSTOMER_STATUSES).map(([value, { label }]) => ({ value, label })),
  ];

  if (isLoading) {
    return <PageSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load customers</p>
      </div>
    );
  }

  const { customers = [], pagination = {} } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage your converted customers</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company, contact, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handleFilterChange('search', e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          />
        </div>
      </Card>

      {/* Customer List */}
      <Card padding={false}>
        {customers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company / Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Converted
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {customer.profilePicUrl ? (
                              <img
                                src={customer.profilePicUrl}
                                alt={customer.companyName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-5 h-5 text-primary-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {customer.companyName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.contactName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {customer.contactEmail && (
                            <div className="flex items-center text-gray-600">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {customer.contactEmail}
                            </div>
                          )}
                          {customer.contactPhone && (
                            <div className="flex items-center text-gray-600 mt-1">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {customer.contactPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={CUSTOMER_STATUSES[customer.status]?.color || 'gray'}>
                          {CUSTOMER_STATUSES[customer.status]?.label || customer.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {customer.city || customer.country ? (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {[customer.city, customer.country].filter(Boolean).join(', ')}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(customer.convertedAt || customer.createdAt)}
                        </div>
                        {customer.convertedBy && (
                          <div className="text-xs text-gray-500">
                            by {customer.convertedBy.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/customers/${customer.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  page={pagination.currentPage || pagination.page}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Building2}
              title="No customers yet"
              description="Customers will appear here when leads are converted"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
