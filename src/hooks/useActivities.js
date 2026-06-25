import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import activityService from '../services/activityService';
import toast from 'react-hot-toast';

export function useActivities(leadId, params = {}) {
  return useQuery({
    queryKey: ['activities', leadId, params],
    queryFn: () => activityService.getActivities(leadId, params),
    enabled: !!leadId,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }) => activityService.createActivity(leadId, data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['activities', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      toast.success('Activity added successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add activity');
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => activityService.updateActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update activity');
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activityService.deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete activity');
    },
  });
}

export function useUpcomingFollowups(days = 7) {
  return useQuery({
    queryKey: ['upcoming-followups', days],
    queryFn: () => activityService.getUpcomingFollowups(days),
  });
}

export function useUploadFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, files }) => activityService.uploadFiles(activityId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Files uploaded successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload files');
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activityService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('File deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete file');
    },
  });
}
