import type { Provider } from "./provider";
import type { Booking } from "./booking";
import type { Complaint } from "./complaint";
import type { Quote } from "./quote";
import type { File } from "./file";
import type { Role, UserStatus } from "./enums";

export interface User {
  id?: string;
  role: Role;
  email: string;
  phone: string;
  password?: string;
  firstName: string;
  lastName: string;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
  Provider?: Provider;
  Bookings?: Booking[];
  Complaints?: Complaint[];
  Quote?: Quote[];
  File?: File[];
}

export type CreateUserInput = {
  role: Role;
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
};
