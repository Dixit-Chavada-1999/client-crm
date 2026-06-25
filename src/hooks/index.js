export { useDebounce } from './useDebounce';
export { useAuth } from './useAuth';
export { useFilePreview } from './useFilePreview';
export { useConfirmDialog } from './useConfirmDialog';

// Lead hooks
export {
  useLeads,
  useLead,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useUpdateLeadStatus,
} from './useLeads';

// Activity hooks
export {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useUpcomingFollowups,
  useUploadFiles,
  useDeleteFile,
} from './useActivities';

// Dashboard hooks
export {
  useDashboardStats,
  useRecentActivities,
  useLeadsByStatus,
} from './useDashboard';
