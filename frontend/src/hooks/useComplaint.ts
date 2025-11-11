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
 * Fetch all complaints (Admin only)
 */
export function useComplaints() {
  return useQuery<Complaint[]>({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await getComplaints();
      return res.data;
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
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
    retry: 1,
  });
};

/**
 * Create a new complaint
 */
export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      toast.success('Complaint submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] }); // Invalidate bookings in case complaints are linked
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || 
        error?.response?.data?.details ||
        error?.message ||
        'Failed to submit complaint';
      toast.error(message);
      console.error('Complaint creation error:', error);
    },
  });
}

/**
 * Update a complaint (Admin only - for status updates)
 */
export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComplaint,
    onSuccess: () => {
      toast.success('Complaint updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || 
        error?.response?.data?.details ||
        error?.message ||
        'Failed to update complaint';
      toast.error(message);
      console.error('❌ Complaint update error:', error);
      console.error('Error details:', error?.response?.data);
    },
  });
}

/**
 * Delete a complaint (Admin only)
 */
export function useDeleteComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComplaint,
    onSuccess: () => {
      toast.success('Complaint deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || 
        error?.response?.data?.details ||
        error?.message ||
        'Failed to delete complaint';
      toast.error(message);
      console.error('Complaint deletion error:', error);
    },
  });
}