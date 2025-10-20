import type { Provider } from "./provider";
import type { Booking } from "./booking";
import type { Complaint } from "./complaint";
import type { Quote } from "./quote";
import type { File } from "./file";
import type { ProviderStatus } from "./enums";

export interface User {
  id: string;
  role: string;
  email: string;
  phone: string;
  password?: string;
  firstName: string;
  lastName: string;
  status: string;
  providerStatus: ProviderStatus;
  providerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  Provider?: Provider;
  Bookings?: Booking[];
  Complaints?: Complaint[];
  Quote?: Quote[];
  File?: File[];
}

export type CreateUserInput = {
  role: string;
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
};

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  providerData?: {
    idNumber: string;
    address: string;
    city: string;
    region?: string;
    postalCode?: string;
    country?: string;
    includeHelpers?: boolean;
  };
}

export interface LoginData {
  email: string;
  password: string;
}
