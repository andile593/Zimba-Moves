import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} from '../services/complaintApi';
import type { Complaint } from '../types/complaint';

/**
 * Fetch all complaints
 */
export function useComplaints() {
  return useQuery<Complaint[]>({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await getComplaints();
      return res.data;
    },
  });
}

/**
 * Fetch a specific complaint by ID
 */
export const useComplaint = (id: string) => {
  return useQuery<Complaint>({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const res = await getComplaintById(id);
      return res.data;
    },
    enabled: !!id,
  });
};

/**
 * Create a new complaint
 */
export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComplaint,
    onMutate: async () => {
      toast.loading('Submitting complaint...');
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success('Complaint submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      toast.dismiss();
      const message =
        error?.response?.data?.error || 'Failed to submit complaint';
      toast.error(message);
    },
  });
}

/**
 * Update a complaint
 */
export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComplaint,
    onMutate: async () => {
      toast.loading('Updating complaint...');
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success('Complaint updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      toast.dismiss();
      const message =
        error?.response?.data?.error || 'Failed to update complaint';
      toast.error(message);
    },
  });
}

/**
 * Delete a complaint
 */
export function useDeleteComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComplaint,
    onMutate: async () => {
      toast.loading('Deleting complaint...');
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success('Complaint deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      toast.dismiss();
      const message =
        error?.response?.data?.error || 'Failed to delete complaint';
      toast.error(message);
    },
  });
}
