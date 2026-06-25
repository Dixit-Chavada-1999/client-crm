import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import ImageUpload from '../common/ImageUpload';
import { LEAD_PRIORITIES, ACTIVITY_TYPES } from '../../utils/constants';

const leadSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  source: z.string().optional(),
  priority: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  industryType: z.string().optional(),
  expectedProjectTime: z.string().optional(),
  notes: z.string().optional(),
  // First activity fields
  firstActivityTitle: z.string().optional(),
  firstActivityType: z.string().optional(),
  firstActivitySummary: z.string().optional(),
  firstActivityDiscussionPoints: z.string().optional(),
  firstActivityClientResponse: z.string().optional(),
  firstActivityNextFollowUpDate: z.string().optional(),
});

export default function LeadForm({ lead, onSubmit, onCancel, isLoading }) {
  const [profilePic, setProfilePic] = useState(null);
  const [websiteLogo, setWebsiteLogo] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(lead?.profilePicUrl || null);
  const [websiteLogoPreview, setWebsiteLogoPreview] = useState(lead?.websiteLogoUrl || null);
  const [profilePicRemoved, setProfilePicRemoved] = useState(false);
  const [websiteLogoRemoved, setWebsiteLogoRemoved] = useState(false);
  const [showFirstActivity, setShowFirstActivity] = useState(!lead); // Show only for new leads

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      companyName: lead?.companyName || '',
      contactName: lead?.contactName || '',
      contactEmail: lead?.contactEmail || '',
      contactPhone: lead?.contactPhone || '',
      website: lead?.website || '',
      source: lead?.source || '',
      priority: lead?.priority || 'medium',
      address: lead?.address || '',
      city: lead?.city || '',
      state: lead?.state || '',
      country: lead?.country || 'India',
      industryType: lead?.industryType || lead?.industry || '',
      expectedProjectTime: lead?.expectedProjectTime || '',
      notes: lead?.notes || '',
      // First activity defaults
      firstActivityTitle: '',
      firstActivityType: 'call',
      firstActivitySummary: '',
      firstActivityDiscussionPoints: '',
      firstActivityClientResponse: '',
      firstActivityNextFollowUpDate: '',
    },
  });

  const handleFormSubmit = (data) => {
    // Separate lead data and first activity data
    const {
      firstActivityTitle,
      firstActivityType,
      firstActivitySummary,
      firstActivityDiscussionPoints,
      firstActivityClientResponse,
      firstActivityNextFollowUpDate,
      ...leadData
    } = data;

    // Clean up the lead data
    const cleanLeadData = {
      ...leadData,
      contactEmail: leadData.contactEmail || null,
      website: leadData.website || null,
      source: leadData.source || null,
    };

    // Prepare first activity if provided
    let firstActivity = null;
    if (showFirstActivity && firstActivityTitle) {
      firstActivity = {
        title: firstActivityTitle,
        type: firstActivityType || 'call',
        summary: firstActivitySummary || null,
        discussionPoints: firstActivityDiscussionPoints || null,
        clientResponse: firstActivityClientResponse || null,
        nextFollowUpDate: firstActivityNextFollowUpDate || null,
      };
    }

    onSubmit({
      leadData: cleanLeadData,
      firstActivity,
      profilePic,
      websiteLogo,
      profilePicRemoved,
      websiteLogoRemoved,
    });
  };

  const priorityOptions = Object.entries(LEAD_PRIORITIES).map(([value, { label }]) => ({
    value,
    label,
  }));

  const activityTypeOptions = Object.entries(ACTIVITY_TYPES).map(([value, { label }]) => ({
    value,
    label,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Client Images */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Client Images</h3>
        <div className="flex flex-wrap gap-6">
          <ImageUpload
            label="Client Profile Picture"
            value={profilePicPreview}
            onChange={(file) => {
              setProfilePic(file);
              setProfilePicRemoved(false);
              // Create preview
              const reader = new FileReader();
              reader.onloadend = () => setProfilePicPreview(reader.result);
              reader.readAsDataURL(file);
            }}
            onRemove={() => {
              setProfilePic(null);
              setProfilePicPreview(null);
              setProfilePicRemoved(true);
            }}
            previewSize="md"
          />
          <ImageUpload
            label="Website Logo"
            value={websiteLogoPreview}
            onChange={(file) => {
              setWebsiteLogo(file);
              setWebsiteLogoRemoved(false);
              // Create preview
              const reader = new FileReader();
              reader.onloadend = () => setWebsiteLogoPreview(reader.result);
              reader.readAsDataURL(file);
            }}
            onRemove={() => {
              setWebsiteLogo(null);
              setWebsiteLogoPreview(null);
              setWebsiteLogoRemoved(true);
            }}
            previewSize="md"
          />
        </div>
      </div>

      {/* Company info */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name *"
            {...register('companyName')}
            error={errors.companyName?.message}
          />
          <Input
            label="Contact Name *"
            {...register('contactName')}
            error={errors.contactName?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('contactEmail')}
            error={errors.contactEmail?.message}
          />
          <Input
            label="Phone"
            {...register('contactPhone')}
            error={errors.contactPhone?.message}
          />
          <Input
            label="Website"
            {...register('website')}
            error={errors.website?.message}
            placeholder="https://"
          />
          <Input
            label="Industry Type"
            {...register('industryType')}
            error={errors.industryType?.message}
            placeholder="e.g., IT, Healthcare, Finance"
          />
        </div>
      </div>

      {/* Lead details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Priority"
            options={priorityOptions}
            {...register('priority')}
            error={errors.priority?.message}
          />
          <Input
            label="Source"
            {...register('source')}
            error={errors.source?.message}
            placeholder="e.g., Website, Referral, LinkedIn"
          />
          <Input
            label="Expected Project Time"
            {...register('expectedProjectTime')}
            error={errors.expectedProjectTime?.message}
            placeholder="e.g., 2-3 months, 6 weeks"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Address"
              {...register('address')}
              error={errors.address?.message}
            />
          </div>
          <Input
            label="City"
            {...register('city')}
            error={errors.city?.message}
          />
          <Input
            label="State"
            {...register('state')}
            error={errors.state?.message}
          />
          <Input
            label="Country"
            {...register('country')}
            error={errors.country?.message}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Textarea
          label="Notes"
          rows={3}
          {...register('notes')}
          error={errors.notes?.message}
        />
      </div>

      {/* First Activity - Only for new leads */}
      {!lead && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">First Call / Activity</h3>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFirstActivity}
                onChange={(e) => setShowFirstActivity(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">Add first activity</span>
            </label>
          </div>

          {showFirstActivity && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Activity Title"
                  {...register('firstActivityTitle')}
                  error={errors.firstActivityTitle?.message}
                  placeholder="e.g., Initial Call with Client"
                />
                <Select
                  label="Activity Type"
                  options={activityTypeOptions}
                  {...register('firstActivityType')}
                  error={errors.firstActivityType?.message}
                />
              </div>
              <Textarea
                label="Summary"
                rows={2}
                {...register('firstActivitySummary')}
                error={errors.firstActivitySummary?.message}
                placeholder="Brief summary of the call/meeting"
              />
              <Textarea
                label="Discussion Points"
                rows={3}
                {...register('firstActivityDiscussionPoints')}
                error={errors.firstActivityDiscussionPoints?.message}
                placeholder="Key points discussed during the call"
              />
              <Textarea
                label="Client Response"
                rows={3}
                {...register('firstActivityClientResponse')}
                error={errors.firstActivityClientResponse?.message}
                placeholder="Client's response or feedback during the conversation"
              />
              <Input
                label="Next Follow-up Date"
                type="date"
                {...register('firstActivityNextFollowUpDate')}
                error={errors.firstActivityNextFollowUpDate?.message}
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {lead ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
