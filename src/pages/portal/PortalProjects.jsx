import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FolderKanban,
    Search,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import { projectsService } from '../../services/customerPortalApi';
import Spinner from '../../components/common/Spinner';
import Input from '../../components/common/Input';

const statusColors = {
    planning: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    on_hold: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function PortalProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchProjects();
    }, [statusFilter]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const response = await projectsService.getAll(params);
            setProjects(response.data.projects || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name?.toLowerCase().includes(search.toLowerCase()) ||
        project.project_number?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PortalLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="text-gray-500 mt-1">View and track your project progress</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
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
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
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
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                    <p className="text-gray-500 mt-1">
                        {search || statusFilter ? 'Try adjusting your filters' : 'You have no active projects'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProjects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/portal/projects/${project.id}`}
                            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-gray-900">
                                            {project.name}
                                        </h3>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                            statusColors[project.status] || 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {project.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {project.project_number}
                                    </p>
                                    {project.description && (
                                        <p className="text-gray-600 mt-2 line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                        {project.start_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Started: {new Date(project.start_date).toLocaleDateString()}
                                            </span>
                                        )}
                                        {project.expected_end_date && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                Due: {new Date(project.expected_end_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            </div>

                            {/* Progress bar */}
                            {project.progress !== undefined && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-gray-500">Progress</span>
                                        <span className="font-medium text-gray-900">{project.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </PortalLayout>
    );
}
