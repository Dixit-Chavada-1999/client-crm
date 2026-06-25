import { useDashboardStats, useLeadsByStatus, useDashboardFollowups, useTopLeads } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { PageSpinner } from '../components/common/Spinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { LEAD_STATUSES, LEAD_PRIORITIES } from '../utils/constants';
import {
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

function StatsCard({ title, value, icon: Icon, description, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <Card>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: leadsByStatus, isLoading: statusLoading } = useLeadsByStatus();
  const { data: followups, isLoading: followupsLoading } = useDashboardFollowups();
  const { data: topLeads, isLoading: topLeadsLoading } = useTopLeads();

  if (statsLoading) {
    return <PageSpinner />;
  }

  const chartData = leadsByStatus?.map((item) => ({
    name: LEAD_STATUSES[item.status]?.label || item.status,
    value: item.count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-500">Here's what's happening with your leads today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={stats?.totalLeads || 0}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="New This Month"
          value={stats?.newLeadsThisMonth || 0}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Total Pipeline Value"
          value={formatCurrency(stats?.totalEstimatedValue || 0)}
          icon={DollarSign}
          color="yellow"
        />
        <StatsCard
          title="Today's Follow-ups"
          value={stats?.todayFollowups || 0}
          icon={Calendar}
          color="red"
        />
      </div>

      {/* Charts and lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by status chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming follow-ups */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Follow-ups</h3>
            <Link to="/leads" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {followupsLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : followups?.length > 0 ? (
              followups.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  to={`/leads/${item.lead?.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.lead?.companyName}
                    </p>
                    <p className="text-sm text-gray-500">{item.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(item.nextFollowUpDate)}
                    </p>
                    <Badge color="blue">{item.type}</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming follow-ups</p>
            )}
          </div>
        </Card>
      </div>

      {/* Top leads */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Pipeline Leads</h3>
          <Link to="/leads" className="text-sm text-primary-600 hover:text-primary-700">
            View all leads
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Expected Close
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topLeadsLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : topLeads?.length > 0 ? (
                topLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600"
                      >
                        {lead.companyName}
                      </Link>
                      <p className="text-sm text-gray-500">{lead.contactName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={LEAD_STATUSES[lead.status]?.color}>
                        {LEAD_STATUSES[lead.status]?.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(lead.estimatedValue)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(lead.expectedCloseDate)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No leads in pipeline
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
