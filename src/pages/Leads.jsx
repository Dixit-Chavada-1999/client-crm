import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, Users } from 'lucide-react';
import { useLeads, useDeleteLead } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Pagination from '../components/common/Pagination';
import { PageSpinner } from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { LEAD_STATUSES, LEAD_SOURCES, LEAD_PRIORITIES } from '../utils/constants';
import { cn } from '../utils/cn';

export default function Leads() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 500);

  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const source = searchParams.get('source') || '';

  const { data, isLoading } = useLeads({
    page,
    search: debouncedSearch,
    status: status || undefined,
    priority: priority || undefined,
    source: source || undefined,
  });

  const deleteLead = useDeleteLead();

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

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteLead.mutate(id);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.entries(LEAD_STATUSES).map(([value, { label }]) => ({ value, label })),
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    ...Object.entries(LEAD_PRIORITIES).map(([value, { label }]) => ({ value, label })),
  ];

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    ...Object.entries(LEAD_SOURCES).map(([value, { label }]) => ({ value, label })),
  ];

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500">Manage your sales leads</p>
        </div>
        <Link to="/leads/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          />
          <Select
            options={priorityOptions}
            value={priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          />
          <Select
            options={sourceOptions}
            value={source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
          />
        </div>
      </Card>

      {/* Leads list */}
      <Card padding={false}>
        {data?.leads?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company / Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {lead.companyName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.contactName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={LEAD_STATUSES[lead.status]?.color}>
                          {LEAD_STATUSES[lead.status]?.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={LEAD_PRIORITIES[lead.priority]?.color}>
                          {LEAD_PRIORITIES[lead.priority]?.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(lead.estimatedValue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {LEAD_SOURCES[lead.source]?.label || lead.source || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/leads/${lead.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/leads/${lead.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => handleDelete(lead.id, e)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  page={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  hasNextPage={data.pagination.hasNextPage}
                  hasPrevPage={data.pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No leads found"
              description="Get started by creating your first lead"
              action={
                <Link to="/leads/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                  </Button>
                </Link>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
