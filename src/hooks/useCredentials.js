import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import credentialService from '../services/credentialService';

export function useProjectCredentials(projectId) {
  return useQuery({
    queryKey: ['credentials', projectId],
    queryFn: () => credentialService.getProjectCredentials(projectId),
    enabled: !!projectId,
  });
}

export function useCredential(id, revealSecrets = false) {
  return useQuery({
    queryKey: ['credential', id, revealSecrets],
    queryFn: () => credentialService.getCredentialById(id, revealSecrets),
    enabled: !!id,
  });
}

export function useCreateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }) => credentialService.createCredential(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['credentials', projectId] });
      toast.success('Credential created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create credential');
    },
  });
}

export function useUpdateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => credentialService.updateCredential(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      toast.success('Credential updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update credential');
    },
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => credentialService.deleteCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      toast.success('Credential deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete credential');
    },
  });
}
