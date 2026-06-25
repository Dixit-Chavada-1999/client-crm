import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Briefcase, DollarSign } from 'lucide-react';
import api from '../../services/api';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import MultiSelect from '../common/MultiSelect';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

const conversionSchema = z.object({
  // Project Details
  projectName: z.string().min(1, 'Project name is required'),
  projectDescription: z.string().optional(),
  projectTypes: z.array(z.string()).min(1, 'At least one project type is required'),

  // Budget & Timeline
  billingCycle: z.string().optional(),
  estimatedHours: z.string().optional(),
  hourlyRate: z.string().optional(),
  currency: z.string().optional(),
  startDate: z.string().optional(),
});

const billingCycles = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const currencies = [
  { value: 'USD', label: '$ USD (US Dollar)' },
  { value: 'INR', label: '₹ INR (Indian Rupee)' },
  { value: 'EUR', label: '€ EUR (Euro)' },
  { value: 'GBP', label: '£ GBP (British Pound)' },
  { value: 'AED', label: 'د.إ AED (UAE Dirham)' },
];

export default function LeadConversionModal({ isOpen, onClose, lead, onConvert, isLoading }) {
  const [step, setStep] = useState(1);

  // Fetch project types from API
  const { data: projectTypesData, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['projectTypes'],
    queryFn: async () => {
      const response = await api.get('/settings/project-types');
      return response.data.data.projectTypes;
    },
    enabled: isOpen,
  });

  // Transform project types for MultiSelect
  const projectTypeOptions = (projectTypesData || []).map((type) => ({
    value: type.slug,
    label: type.name,
  }));

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(conversionSchema),
    defaultValues: {
      projectName: lead ? `${lead.companyName} Project` : '',
      projectDescription: '',
      projectTypes: [],
      billingCycle: 'weekly',
      estimatedHours: '',
      hourlyRate: '',
      currency: 'USD',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const billingCycle = watch('billingCycle');

  // Get hours label based on billing cycle
  const hoursLabel = billingCycle === 'monthly' ? 'Monthly Hours' : 'Weekly Hours';
  const hoursPlaceholder = billingCycle === 'monthly' ? 'e.g., 160' : 'e.g., 40';

  // Handle final submission - only called when clicking "Convert to Customer"
  const handleConvertClick = () => {
    handleSubmit((data) => {
      onConvert({
        ...data,
        status: 'converted', // Always set to converted when converting
        estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : null,
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
        createProject: true,
        createPortalAccess: true,
      });
    })();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Lead to Customer"
      size="lg"
    >
      <div className="space-y-6">
        {/* Lead Info Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">{lead?.companyName}</h3>
              <p className="text-sm text-blue-700">{lead?.contactName} • {lead?.contactEmail}</p>
            </div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center space-x-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              step === 1 ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium">Project Details</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              step === 2 ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Budget & Timeline</span>
          </button>
        </div>

        {/* Step 1: Project Details */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Project Name *"
              {...register('projectName')}
              error={errors.projectName?.message}
              placeholder="e.g., Website Redesign Project"
            />
            <Controller
              name="projectTypes"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Project Type *"
                  options={projectTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.projectTypes?.message}
                  placeholder={isLoadingTypes ? 'Loading types...' : 'Select project types'}
                  disabled={isLoadingTypes}
                />
              )}
            />
            <Textarea
              label="Project Description"
              rows={3}
              {...register('projectDescription')}
              error={errors.projectDescription?.message}
              placeholder="Brief description of the project scope and objectives"
            />
          </div>
        )}

        {/* Step 2: Budget & Timeline */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="billingCycle"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Billing Cycle"
                    options={billingCycles}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={errors.billingCycle?.message}
                  />
                )}
              />
              <Input
                label={hoursLabel}
                type="number"
                {...register('estimatedHours')}
                error={errors.estimatedHours?.message}
                placeholder={hoursPlaceholder}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Hourly Rate"
                type="number"
                {...register('hourlyRate')}
                error={errors.hourlyRate?.message}
                placeholder="e.g., 25"
              />
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Currency"
                    options={currencies}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={errors.currency?.message}
                  />
                )}
              />
            </div>
            <Input
              label="Project Start Date"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {step > 1 && (
              <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {step < 2 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleConvertClick} isLoading={isLoading}>
                <Building2 className="w-4 h-4 mr-2" />
                Convert to Customer
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
