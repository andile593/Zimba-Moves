// frontend/src/types/provider.ts
import type { Vehicle } from "./vehicle";
import type { Booking } from "./booking";
import type { Quote } from "./quote";
import type { Payment } from "./payment";
import type { File } from "./file";

export interface Provider {
  id: string;
  userId: string;
    user?: {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    
  };
  earnings?: number;
  includeHelpers?: boolean;
  
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  
  createdAt?: string;
  updatedAt?: string;
  vehicles?: Vehicle[];
  bookings?: Booking[];
  Quote?: Quote[];
  Payment?: Payment[];
  File?: File[];
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