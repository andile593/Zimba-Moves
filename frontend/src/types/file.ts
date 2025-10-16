import type { FileType, FileCategory, FileStatus } from "./enums";

export interface File {
  id?: string;
  url: string;
  type: FileType;
  category: FileCategory;
  status?: FileStatus;
  createdAt?: string;
  complaintId?: string;
  providerId?: string;
  userId?: string;
  vehicleId?: string;
}

export type CreateFileInput = {
  url: string;
  type: FileType;
  category: FileCategory;
  complaintId?: string;
  providerId?: string;
  userId?: string;
};
