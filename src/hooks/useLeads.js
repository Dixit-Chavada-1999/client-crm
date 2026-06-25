import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import leadService from '../services/leadService';
import toast from 'react-hot-toast';

export function useLeads(params = {}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadService.getLeads(params),
  });
}

export function useLead(id) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadService.getLeadById(id),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadService.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create lead');
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => leadService.updateLead(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      toast.success('Lead updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update lead');
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }) => leadService.updateStatus(id, status, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadService.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
    },
  });
}

export function useLeadStatusHistory(id) {
  return useQuery({
    queryKey: ['lead-history', id],
    queryFn: () => leadService.getStatusHistory(id),
    enabled: !!id,
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }) => leadService.convertToCustomer(leadId, data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Lead converted to customer successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to convert lead');
    },
  });
}
