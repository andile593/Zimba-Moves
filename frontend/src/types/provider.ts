import type { Vehicle } from "./vehicle";
import type { Booking } from "./booking";
import type { Quote } from "./quote";
import type { Payment } from "./payment";
import type { File } from "./file";

export type ProviderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Provider {
  id: string;
  userId: string;
  status?: ProviderStatus;
  user?: {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
  };
  earnings?: number;
  includeHelpers?: boolean;
  
  // Business info
  businessName?: string;
  businessType?: string;
  idNumber?: string;
  taxNumber?: string;
  
  // Location
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  
  // Application review
  rejectionReason?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  
  createdAt?: string;
  updatedAt?: string;
  vehicles?: Vehicle[];
  bookings?: Booking[];
  Quote?: Quote[];
  Payment?: Payment[];
  files?: File[];
  distance?: number | null;
}

export type CreateProviderInput = {
  includeHelpers?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
};