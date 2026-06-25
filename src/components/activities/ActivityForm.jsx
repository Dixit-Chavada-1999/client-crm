import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, FileText, Image } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { ACTIVITY_TYPES } from '../../utils/constants';

const activitySchema = z.object({
  type: z.string().min(1, 'Type is required'),
  title: z.string().min(1, 'Title is required'),
  summary: z.string().optional(),
  discussionPoints: z.string().optional(),
  clientResponse: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
  durationMinutes: z.string().optional(),
  callOutcome: z.string().optional(),
  meetingLocation: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ActivityForm({ activity, onSubmit, onCancel, isLoading }) {
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: activity?.type || 'call',
      title: activity?.title || '',
      summary: activity?.summary || '',
      discussionPoints: activity?.discussionPoints || '',
      clientResponse: activity?.clientResponse || '',
      nextFollowUpDate: activity?.nextFollowUpDate?.split('T')[0] || '',
      durationMinutes: activity?.durationMinutes?.toString() || '',
      callOutcome: activity?.callOutcome || '',
      meetingLocation: activity?.meetingLocation || '',
      isCompleted: activity?.isCompleted || false,
    },
  });

  const activityType = watch('type');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFileError('');

    const validFiles = [];
    for (const file of selectedFiles) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError('Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError('File too large. Maximum size is 10MB');
        continue;
      }
      validFiles.push(file);
    }

    setFiles((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    e.target.value = ''; // Reset input
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFormSubmit = (data) => {
    const cleanData = {
      ...data,
      durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes) : null,
      nextFollowUpDate: data.nextFollowUpDate || null,
      clientResponse: data.clientResponse || null,
      callOutcome: data.callOutcome || null,
      meetingLocation: data.meetingLocation || null,
      files, // Include files
    };
    onSubmit(cleanData);
  };

  const typeOptions = Object.entries(ACTIVITY_TYPES).map(([value, { label }]) => ({
    value,
    label,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Activity Type *"
          options={typeOptions}
          {...register('type')}
          error={errors.type?.message}
        />
        <Input
          label="Title *"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Enter a brief title"
        />
      </div>

      <Textarea
        label="Summary"
        rows={3}
        {...register('summary')}
        error={errors.summary?.message}
        placeholder="Brief summary of the activity"
      />

      <Textarea
        label="Discussion Points"
        rows={3}
        {...register('discussionPoints')}
        error={errors.discussionPoints?.message}
        placeholder="Key points discussed"
      />

      <Textarea
        label="Client Response"
        rows={3}
        {...register('clientResponse')}
        error={errors.clientResponse?.message}
        placeholder="Client's response or feedback during the conversation"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Next Follow-up Date"
          type="date"
          {...register('nextFollowUpDate')}
          error={errors.nextFollowUpDate?.message}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          {...register('durationMinutes')}
          error={errors.durationMinutes?.message}
        />
      </div>

      {activityType === 'call' && (
        <Input
          label="Call Outcome"
          {...register('callOutcome')}
          error={errors.callOutcome?.message}
          placeholder="e.g., Successful, No Answer, Callback Required"
        />
      )}

      {activityType === 'meeting' && (
        <Input
          label="Meeting Location"
          {...register('meetingLocation')}
          error={errors.meetingLocation?.message}
          placeholder="e.g., Office, Video Call, Client Location"
        />
      )}

      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500 transition-colors"
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Click to upload files
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (max 10MB, up to 5 files)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
        {fileError && (
          <p className="mt-1 text-sm text-red-600">{fileError}</p>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isCompleted"
          {...register('isCompleted')}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isCompleted" className="ml-2 text-sm text-gray-700">
          Mark as completed
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {activity ? 'Update Activity' : 'Add Activity'}
        </Button>
      </div>
    </form>
  );
}
