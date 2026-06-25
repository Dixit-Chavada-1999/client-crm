import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLead, useUpdateLead } from '../hooks/useLeads';
import Card from '../components/common/Card';
import LeadForm from '../components/leads/LeadForm';
import { PageSpinner } from '../components/common/Spinner';
import leadService from '../services/leadService';

export default function LeadEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();

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

  const handleSubmit = async ({ leadData, profilePic, websiteLogo, profilePicRemoved, websiteLogoRemoved }) => {
    try {
      // Start with existing image URLs
      let profilePicUrl = profilePicRemoved ? null : lead.profilePicUrl;
      let websiteLogoUrl = websiteLogoRemoved ? null : lead.websiteLogoUrl;

      // Upload new images if provided
      if (profilePic || websiteLogo) {
        const uploadResult = await leadService.uploadLeadImages(profilePic, websiteLogo);
        if (uploadResult.profilePicUrl) profilePicUrl = uploadResult.profilePicUrl;
        if (uploadResult.websiteLogoUrl) websiteLogoUrl = uploadResult.websiteLogoUrl;
      }

      await updateLead.mutateAsync({
        id,
        data: {
          ...leadData,
          profilePicUrl,
          websiteLogoUrl,
        },
      });

      navigate(`/leads/${id}`);
    } catch (error) {
      console.error('Error updating lead:', error);
      // Error toast is handled by useUpdateLead hook
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
          <p className="text-gray-500">{lead.companyName}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <LeadForm
          lead={lead}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          isLoading={updateLead.isPending}
        />
      </Card>
    </div>
  );
}
