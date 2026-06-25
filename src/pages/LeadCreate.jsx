import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateLead } from '../hooks/useLeads';
import { useCreateActivity } from '../hooks/useActivities';
import Card from '../components/common/Card';
import LeadForm from '../components/leads/LeadForm';
import leadService from '../services/leadService';
import toast from 'react-hot-toast';

export default function LeadCreate() {
  const navigate = useNavigate();
  const createLead = useCreateLead();
  const createActivity = useCreateActivity();

  const handleSubmit = async ({ leadData, firstActivity, profilePic, websiteLogo }) => {
    try {
      // Upload images first if provided
      let profilePicUrl = null;
      let websiteLogoUrl = null;

      if (profilePic || websiteLogo) {
        const uploadResult = await leadService.uploadLeadImages(profilePic, websiteLogo);
        profilePicUrl = uploadResult.profilePicUrl;
        websiteLogoUrl = uploadResult.websiteLogoUrl;
      }

      // Create lead with image URLs
      const lead = await createLead.mutateAsync({
        ...leadData,
        profilePicUrl,
        websiteLogoUrl,
      });

      // Create first activity if provided
      if (firstActivity && firstActivity.title) {
        await createActivity.mutateAsync({
          leadId: lead.id,
          data: firstActivity,
        });
      }

      navigate(`/leads/${lead.id}`);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Failed to create lead');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
          <p className="text-gray-500">Add a new lead to your pipeline</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <LeadForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          isLoading={createLead.isPending || createActivity.isPending}
        />
      </Card>
    </div>
  );
}
