export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type VehicleType =
  | "SMALL_VAN"
  | "MEDIUM_TRUCK"
  | "LARGE_TRUCK"
  | "OTHER";

export type MoveType = "APARTMENT" | "OFFICE" | "SINGLE_ITEM" | "OTHER";

export type HelpersSource = "PROVIDER" | "CUSTOMER";

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type RefundStatus = "PENDING" | "INITIATED" | "COMPLETED" | "FAILED";

export type ComplaintStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";

export type IssueTarget = "PROVIDER" | "HELPER" | "OTHER";

export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export type FileType = "IMAGE" | "DOCUMENT" | "IN_PROGRESS" ;

export type FileCategory =
  | "BRANDING"
  | "EVIDENCE"
  | "PROFILE_PIC"
  | "ID_DOCUMENT"
  | "PROOF_OF_ADDRESS"
  | "VEHICLE_REGISTRATION_CERT"
  | "DRIVERS_LICENSE"
  | "OTHER";

export type FileStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ProviderStatus = "PENDING" | "APPROVED" | "REJECTED";
