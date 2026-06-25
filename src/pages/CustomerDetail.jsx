import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  User,
  FileText,
  FolderOpen,
  Users,
  Briefcase,
  Key,
  ChevronRight,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { PageSpinner } from '../components/common/Spinner';
import { formatDate } from '../utils/formatters';
import CredentialModal from '../components/credentials/CredentialModal';
import ProjectModal from '../components/projects/ProjectModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const statusColors = {
  active: 'green',
  inactive: 'gray',
  suspended: 'red',
};

const projectStatusColors = {
  planning: 'gray',
  in_progress: 'blue',
  on_hold: 'yellow',
  completed: 'green',
  cancelled: 'red',
};

export default function CustomerDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectSubTab, setProjectSubTab] = useState('details');
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const queryClient = useQueryClient();

  // Update project credentials mutation
  const updateCredentials = useMutation({
    mutationFn: async ({ projectId, credentials }) => {
      const response = await api.put(`/customers/projects/${projectId}/credentials`, { credentials });
      return response.data.data.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerProjects', id] });
      toast.success('Credentials saved successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save credentials');
    },
  });

  // Create project mutation
  const createProject = useMutation({
    mutationFn: async (projectData) => {
      const response = await api.post(`/customers/${id}/projects`, projectData);
      return response.data.data.project;
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['customerProjects', id] });
      queryClient.invalidateQueries({ queryKey: ['customerStats', id] });
      toast.success('Project created successfully');
      setSelectedProject(newProject);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create project');
    },
  });

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await api.get(`/customers/${id}`);
      return response.data.data.customer;
    },
  });


  const { data: users } = useQuery({
    queryKey: ['customerUsers', id],
    queryFn: async () => {
      const response = await api.get(`/customers/${id}/users`);
      return response.data.data.users;
    },
    enabled: !!customer,
  });

  const { data: projects } = useQuery({
    queryKey: ['customerProjects', id],
    queryFn: async () => {
      const response = await api.get(`/customers/${id}/projects`);
      return response.data.data.projects || [];
    },
    enabled: !!customer,
  });

  if (isLoading) {
    return <PageSpinner />;
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load customer</p>
        <Link to="/customers" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to Customers
        </Link>
      </div>
    );
  }

  const mainTabs = [
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'details', label: 'Customer Details', icon: Building2 },
  ];

  const projectSubTabs = [
    { id: 'details', label: 'Project Details', icon: FileText },
    { id: 'credentials', label: 'Project Credentials', icon: Key },
  ];

  // Project handlers
  const handleAddProject = () => {
    setShowProjectModal(true);
  };

  const handleSaveProject = async (data) => {
    await createProject.mutateAsync(data);
    setShowProjectModal(false);
  };

  // Credential handlers
  const handleAddCredential = () => {
    setShowCredentialModal(true);
  };

  const handleSaveCredential = async (data) => {
    await updateCredentials.mutateAsync({
      projectId: selectedProject.id,
      credentials: data.notes,
    });
    // Update selected project with new credentials
    setSelectedProject(prev => ({ ...prev, credentials: data.notes }));
    setShowCredentialModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/customers"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {customer.profilePicUrl ? (
                <img
                  src={customer.profilePicUrl}
                  alt={customer.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-primary-600" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">{customer.companyName}</h1>
                {customer.websiteLogoUrl && (
                  <img
                    src={customer.websiteLogoUrl}
                    alt="Logo"
                    className="h-6 w-auto"
                  />
                )}
              </div>
              <p className="text-gray-500">{customer.contactName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge color={statusColors[customer.status] || 'gray'} size="lg">
            {customer.status}
          </Badge>
        </div>
      </div>


      {/* Main Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedProject(null);
                }}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-1">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
                <Button size="sm" onClick={handleAddProject}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {projects && projects.length > 0 ? (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setSelectedProject(project);
                        setProjectSubTab('details');
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedProject?.id === project.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                          <p className="text-sm text-gray-500">{project.projectCode}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="mt-2">
                        <Badge color={projectStatusColors[project.status] || 'gray'} size="sm">
                          {project.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No projects yet</p>
                  <p className="text-xs text-gray-400 mt-1">Projects created during lead conversion will appear here</p>
                </div>
              )}
            </Card>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <Card>
                {/* Project Sub Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-6">
                    {projectSubTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setProjectSubTab(tab.id)}
                          className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            projectSubTab === tab.id
                              ? 'border-primary-500 text-primary-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Project Details Sub Tab */}
                {projectSubTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedProject.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{selectedProject.projectCode}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge color={projectStatusColors[selectedProject.status] || 'gray'}>
                          {selectedProject.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Billing Cycle</p>
                        <p className="text-gray-900 capitalize">{selectedProject.billingCycle || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="text-gray-900">{formatDate(selectedProject.startDate) || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Hours</p>
                        <p className="text-gray-900">{selectedProject.estimatedHours || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Hourly Rate</p>
                        <p className="text-gray-900">
                          {selectedProject.hourlyRate
                            ? `${selectedProject.currency || '$'} ${selectedProject.hourlyRate}`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Project Types</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedProject.projectTypes?.length > 0 ? (
                            selectedProject.projectTypes.map((type) => (
                              <Badge key={type} color="blue" size="sm">{type}</Badge>
                            ))
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedProject.description && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Description</p>
                        <p className="text-gray-700">{selectedProject.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Project Credentials Sub Tab */}
                {projectSubTab === 'credentials' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Project Credentials</h3>
                      <Button size="sm" variant="secondary" onClick={handleAddCredential}>
                        {selectedProject.credentials ? (
                          <>
                            <Key className="w-4 h-4 mr-1" />
                            Edit Credential
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Credential
                          </>
                        )}
                      </Button>
                    </div>

                    {selectedProject.credentials ? (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div
                          className="prose prose-sm max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: selectedProject.credentials }}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No credentials added yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Store login credentials, API keys, and other sensitive information securely
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ) : (
              <Card>
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Select a project to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.contactEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${customer.contactEmail}`} className="text-primary-600 hover:underline">
                        {customer.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                {customer.contactPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a href={`tel:${customer.contactPhone}`} className="text-primary-600 hover:underline">
                        {customer.contactPhone}
                      </a>
                    </div>
                  </div>
                )}
                {customer.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {customer.website}
                      </a>
                    </div>
                  </div>
                )}
                {(customer.city || customer.state || customer.country) && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-900">
                        {[customer.city, customer.state, customer.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {customer.address && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Full Address</p>
                  <p className="text-gray-900">{customer.address}</p>
                </div>
              )}
            </Card>

            {/* Business Details */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.industryType && (
                  <div>
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="text-gray-900">{customer.industryType}</p>
                  </div>
                )}
                {customer.gstNumber && (
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-gray-900">{customer.gstNumber}</p>
                  </div>
                )}
                {customer.panNumber && (
                  <div>
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="text-gray-900">{customer.panNumber}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Notes */}
            {customer.notes && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{customer.notes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Converted On</p>
                    <p className="text-gray-900">{formatDate(customer.convertedAt)}</p>
                  </div>
                </div>
                {customer.convertedBy && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Converted By</p>
                      <p className="text-gray-900">{customer.convertedBy.name}</p>
                    </div>
                  </div>
                )}
                {customer.leadId && (
                  <div className="pt-2">
                    <Link
                      to={`/leads/${customer.leadId}`}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      View Original Lead
                    </Link>
                  </div>
                )}
              </div>
            </Card>

            {/* Portal Users */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Portal Users</h2>
                <Button size="sm" variant="secondary">
                  Add User
                </Button>
              </div>
              {users && users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Badge color={user.isActive ? 'green' : 'gray'} size="sm">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No portal users yet</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSave={handleSaveProject}
        isLoading={createProject.isPending}
      />

      {/* Credential Modal */}
      <CredentialModal
        isOpen={showCredentialModal}
        onClose={() => setShowCredentialModal(false)}
        onSave={handleSaveCredential}
        credential={selectedProject?.credentials ? { notes: selectedProject.credentials } : null}
        isLoading={updateCredentials.isPending}
      />
    </div>
  );
}
