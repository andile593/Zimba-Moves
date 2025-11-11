import type { ComplaintStatus, IssueTarget } from "./enums";
import type { File } from "./file";

export interface Complaint {
  id?: string;
  customerId: string;
  bookingId: string;
  plateNumber?: string; 
  issueTarget: IssueTarget;
  description: string;
  status?: ComplaintStatus;
  createdAt?: string;
  updatedAt?: string;
  File?: File[];
}

export interface CreateComplaintInput {
  bookingId: string; 
  plateNumber?: string;
  issueTarget: "PROVIDER" | "HELPER" | "OTHER";
  description: string;
}

export interface UpdateComplaintInput {
  id: string;
  status?: ComplaintStatus;
}