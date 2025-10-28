import type { Vehicle } from "./vehicle";
import type { Booking } from "./booking";
import type { Quote } from "./quote";
import type { Payment, PaymentCard } from "./payment";
import type { File } from "./file";
import type { ProviderStatus } from "./enums";

export interface Provider {
  id: string;
  userId: string;
  status?: ProviderStatus;
  user?: {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    role: string;
  };
  earnings?: number;
  idNumber?: string;
  includeHelpers?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  rejectionReason?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  vehicles?: Vehicle[];
  bookings?: Booking[];
  Quote?: Quote[];
  Payment?: Payment[];
  files?: File[];
  distance?: number | null;
  paymentCards?: PaymentCard[];
}

export type CreateProviderInput = {
  includeHelpers?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  rating?: number;
  postalCode?: string;
};

export interface ProviderStats {
  rating: number;
  reviews: number;
  bookings: number;
  vehicles: number;
}
