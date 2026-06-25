import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderKanban,
  Plus,
  Edit,
  X,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import api from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

// Settings menu items - add more modules here in future
const settingsMenu = [
  { id: 'project-types', label: 'Project Types', icon: FolderKanban },
  // Future modules:
  // { id: 'lead-sources', label: 'Lead Sources', icon: Target },
  // { id: 'lead-statuses', label: 'Lead Statuses', icon: Flag },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('project-types');

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage system configurations</p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <nav>
              {settingsMenu.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3.5 text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                  } ${index !== 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'project-types' && <ProjectTypesContent />}
        </div>
      </div>
    </div>
  );
}

// Project Types Content Component
function ProjectTypesContent() {
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null });
  const queryClient = useQueryClient();

  // Fetch project types
  const { data: projectTypes, isLoading } = useQuery({
    queryKey: ['projectTypes', { includeInactive: true }],
    queryFn: async () => {
      const response = await api.get('/settings/project-types?includeInactive=true');
      return response.data.data.projectTypes;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/settings/project-types', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTypes'] });
      closeModal();
      toast.success('Project type created');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/settings/project-types/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTypes'] });
      closeModal();
      toast.success('Project type updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update');
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.put(`/settings/project-types/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTypes'] });
      toast.success('Status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/settings/project-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTypes'] });
      toast.success('Project type deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete');
    },
  });

  const openAddModal = () => {
    setEditingType(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const openEditModal = (type) => {
    setEditingType(type);
    setFormData({ name: type.name });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingType(null);
    setFormData({ name: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (type) => {
    toggleActiveMutation.mutate({ id: type.id, isActive: !type.isActive });
  };

  const openDeleteConfirm = (type) => {
    setDeleteConfirm({ isOpen: true, type });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, type: null });
  };

  const confirmDelete = () => {
    if (deleteConfirm.type) {
      deleteMutation.mutate(deleteConfirm.type.id);
      closeDeleteConfirm();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FolderKanban className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Project Types</h2>
        </div>
        <Button onClick={openAddModal} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Project Type
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[35%]">
                  Name
                </th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">
                  Slug
                </th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                  Status
                </th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {projectTypes?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    <FolderKanban className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No project types yet</p>
                    <p className="text-sm mt-1">Add your first project type to get started</p>
                  </td>
                </tr>
              ) : (
                projectTypes?.map((type, index) => (
                  <tr
                    key={type.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      index !== projectTypes.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <td className="py-4 px-5">
                      <span className="font-medium text-gray-900">{type.name}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-gray-500 text-sm font-mono">{type.slug}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          type.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {type.isActive ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <ActionDropdown
                        onEdit={() => openEditModal(type)}
                        onToggleActive={() => handleToggleActive(type)}
                        onDelete={() => openDeleteConfirm(type)}
                        isActive={type.isActive}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingType ? 'Edit Project Type' : 'Add Project Type'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Web Development"
            autoFocus
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingType ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title="Delete Project Type"
        message={`Are you sure you want to delete "${deleteConfirm.type?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// Action Dropdown Component
function ActionDropdown({ onEdit, onToggleActive, onDelete, isActive }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-sm transition-all duration-200 ${
          isOpen
            ? 'border-primary-300 text-primary-700 bg-primary-50'
            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        Actions
        <ChevronDown className={`w-4 h-4 ml-1.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4 mr-3 text-gray-400" />
            Edit
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onToggleActive();
            }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4 mr-3 text-gray-400" />
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
