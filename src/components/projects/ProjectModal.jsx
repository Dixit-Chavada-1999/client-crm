import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderPlus, Save, X } from 'lucide-react';
import api from '../../services/api';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import MultiSelect from '../common/MultiSelect';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  projectTypes: z.array(z.string()).min(1, 'At least one project type is required'),
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

export default function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project = null,
  isLoading = false,
}) {
  const isEditing = !!project;

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
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      projectTypes: [],
      billingCycle: 'weekly',
      estimatedHours: '',
      hourlyRate: '',
      currency: 'USD',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name || '',
        description: project.description || '',
        projectTypes: project.projectTypes || [],
        billingCycle: project.billingCycle || 'weekly',
        estimatedHours: project.estimatedHours?.toString() || '',
        hourlyRate: project.hourlyRate?.toString() || '',
        currency: project.currency || 'USD',
        startDate: project.startDate || new Date().toISOString().split('T')[0],
      });
    } else {
      reset({
        name: '',
        description: '',
        projectTypes: [],
        billingCycle: 'weekly',
        estimatedHours: '',
        hourlyRate: '',
        currency: 'USD',
        startDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [project, reset, isOpen]);

  const billingCycle = watch('billingCycle');
  const hoursLabel = billingCycle === 'monthly' ? 'Monthly Hours' : 'Weekly Hours';
  const hoursPlaceholder = billingCycle === 'monthly' ? 'e.g., 160' : 'e.g., 40';

  const onSubmit = (data) => {
    onSave({
      ...data,
      estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : null,
      hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <FolderPlus className="w-5 h-5 text-primary-600" />
          <span>{isEditing ? 'Edit Project' : 'Add New Project'}</span>
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Name */}
        <Input
          label="Project Name *"
          {...register('name')}
          error={errors.name?.message}
          placeholder="e.g., Website Redesign Project"
        />

        {/* Project Types */}
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

        {/* Description */}
        <Textarea
          label="Description"
          rows={3}
          {...register('description')}
          error={errors.description?.message}
          placeholder="Brief description of the project scope and objectives"
        />

        {/* Billing & Hours Row */}
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

        {/* Rate & Currency Row */}
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

        {/* Start Date */}
        <Input
          label="Start Date"
          type="date"
          {...register('startDate')}
          error={errors.startDate?.message}
        />

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1" />
            {isEditing ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
