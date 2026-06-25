import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building,
  Building2,
  Calendar,
  DollarSign,
  User,
  Plus,
  Clock,
  Briefcase,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useLead, useDeleteLead, useUpdateLeadStatus, useConvertLead } from '../hooks/useLeads';
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity, useUploadFiles } from '../hooks/useActivities';
import { useFilePreview } from '../hooks/useFilePreview';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Select from '../components/common/Select';
import { PageSpinner } from '../components/common/Spinner';
import FilePreview from '../components/common/FilePreview';
import ActivityTimeline from '../components/activities/ActivityTimeline';
import ActivityForm from '../components/activities/ActivityForm';
import LeadConversionModal from '../components/leads/LeadConversionModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { LEAD_STATUSES, LEAD_PRIORITIES } from '../utils/constants';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [editingActivity, setEditingActivity] = useState(null);

  const { previewFile, previewUrl, openPreview, closePreview } = useFilePreview();

  const { data: lead, isLoading } = useLead(id);
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities(id);
  const deleteLead = useDeleteLead();
  const updateStatus = useUpdateLeadStatus();
  const convertLead = useConvertLead();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const uploadFiles = useUploadFiles();

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lead not found</p>
        <Link to="/leads" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to leads
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await deleteLead.mutateAsync(id);
      navigate('/leads');
    }
  };

  const handleStatusChange = async () => {
    if (newStatus && newStatus !== lead.status) {
      // If changing to converted, show conversion modal instead
      if (newStatus === 'converted') {
        setShowStatusModal(false);
        setShowConversionModal(true);
        return;
      }
      await updateStatus.mutateAsync({ id, status: newStatus });
      setShowStatusModal(false);
    }
  };

  const handleConvert = async (conversionData) => {
    await convertLead.mutateAsync({
      leadId: id,
      data: {
        ...conversionData,
        createProject: true,
      }
    });
    setShowConversionModal(false);
  };

  const handleActivitySubmit = async (data) => {
    const { files, ...activityData } = data;

    if (editingActivity) {
      // Update existing activity
      await updateActivity.mutateAsync({ id: editingActivity.id, data: activityData });

      // Upload new files if any
      if (files && files.length > 0) {
        await uploadFiles.mutateAsync({ activityId: editingActivity.id, files });
      }

      setEditingActivity(null);
    } else {
      // Create new activity
      const activity = await createActivity.mutateAsync({ leadId: id, data: activityData });

      // Upload files if any
      if (files && files.length > 0 && activity?.id) {
        await uploadFiles.mutateAsync({ activityId: activity.id, files });
      }
    }

    setShowActivityModal(false);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  const handleDeleteActivity = async (activity) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity.mutateAsync(activity.id);
    }
  };

  const statusOptions = Object.entries(LEAD_STATUSES).map(([value, { label }]) => ({
    value,
    label,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/leads"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          {/* Profile Picture */}
          {lead.profilePicUrl ? (
            <img
              src={lead.profilePicUrl}
              alt={lead.companyName}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
              <Building className="w-6 h-6 text-primary-600" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{lead.companyName}</h1>
              {/* Website Logo */}
              {lead.websiteLogoUrl && (
                <img
                  src={lead.websiteLogoUrl}
                  alt="Website Logo"
                  className="h-8 object-contain"
                />
              )}
            </div>
            <p className="text-gray-500">{lead.contactName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link to={`/leads/${id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and priority */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setNewStatus(lead.status);
                  setShowStatusModal(true);
                }}
              >
                Change Status
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Status</p>
                <Badge color={LEAD_STATUSES[lead.status]?.color} className="text-sm">
                  {LEAD_STATUSES[lead.status]?.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Priority</p>
                <Badge color={LEAD_PRIORITIES[lead.priority]?.color} className="text-sm">
                  {LEAD_PRIORITIES[lead.priority]?.label}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Customer Account - shown when lead is converted */}
          {lead.customer && (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800">Converted to Customer</h3>
                  <p className="text-sm text-green-700 mt-1">
                    This lead has been converted to a customer account.
                  </p>
                  <Link
                    to={`/customers/${lead.customer.id}`}
                    className="inline-flex items-center mt-3 text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    <Building2 className="w-4 h-4 mr-1" />
                    View Customer Profile
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Activity timeline */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
              <Button size="sm" onClick={() => setShowActivityModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>
            <ActivityTimeline
              activities={activitiesData?.activities || []}
              isLoading={activitiesLoading}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
              onFileClick={openPreview}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {lead.contactEmail && (
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <a href={`mailto:${lead.contactEmail}`} className="text-primary-600 hover:text-primary-700">
                    {lead.contactEmail}
                  </a>
                </div>
              )}
              {lead.contactPhone && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  <a href={`tel:${lead.contactPhone}`} className="text-primary-600 hover:text-primary-700">
                    {lead.contactPhone}
                  </a>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 text-gray-400 mr-3" />
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                    {lead.website}
                  </a>
                </div>
              )}
              {(lead.address || lead.city || lead.state || lead.country) && (
                <div className="flex items-start text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-gray-600">
                    {[lead.address, lead.city, lead.state, lead.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {(lead.industryType || lead.industry) && (
                <div className="flex items-center text-sm">
                  <Briefcase className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">{lead.industryType || lead.industry}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Project info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            <div className="space-y-3">
              {lead.expectedProjectTime && (
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-gray-500">Expected Project Time</p>
                    <p className="font-semibold text-gray-900">{lead.expectedProjectTime}</p>
                  </div>
                </div>
              )}
              {lead.source && (
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-gray-500">Source</p>
                    <p className="font-semibold text-gray-900">{lead.source}</p>
                  </div>
                </div>
              )}
              {lead.createdBy && (
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p className="font-semibold text-gray-900">{lead.createdBy.name}</p>
                  </div>
                </div>
              )}
              {lead.createdAt && (
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-gray-500">Created On</p>
                    <p className="font-semibold text-gray-900">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Tags */}
          {lead.tags?.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag) => (
                  <Badge key={tag} color="blue">{tag}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {lead.notes && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{lead.notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Status change modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Lead Status"
      >
        <div className="space-y-4">
          <Select
            label="New Status"
            options={statusOptions}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} isLoading={updateStatus.isPending}>
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Activity form modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => {
          setShowActivityModal(false);
          setEditingActivity(null);
        }}
        title={editingActivity ? 'Edit Activity' : 'Add Activity'}
        size="lg"
      >
        <ActivityForm
          activity={editingActivity}
          onSubmit={handleActivitySubmit}
          onCancel={() => {
            setShowActivityModal(false);
            setEditingActivity(null);
          }}
          isLoading={createActivity.isPending || updateActivity.isPending || uploadFiles.isPending}
        />
      </Modal>

      {/* File preview modal */}
      <FilePreview
        file={previewFile}
        url={previewUrl}
        onClose={closePreview}
      />

      {/* Lead conversion modal */}
      <LeadConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        lead={lead}
        onConvert={handleConvert}
        isLoading={convertLead.isPending}
      />
    </div>
  );
}
