import api from './axios';
import type { Complaint, CreateComplaintInput } from '../types';

export const getComplaints = () => api.get<Complaint[]>('/complaints');
export const getComplaintById = (id: string) => api.get<Complaint>(`/complaints/${id}`)
export const createComplaint = (complaint: CreateComplaintInput) => api.post<Complaint>('/complaints', complaint)

export type UpdateComplaintInput = { id: string; complaint: Partial<Complaint> };
export const updateComplaint = ({ id, complaint }: UpdateComplaintInput) => 
  api.put(`/complaints/${id}`, complaint);

export type DeleteComplaintInput = { id: string };
export const deleteComplaint= ({ id }: DeleteComplaintInput) => 
  api.delete(`/complaints/${id}`);
