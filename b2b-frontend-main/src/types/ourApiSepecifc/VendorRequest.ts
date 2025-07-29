import { User } from "./User";

export type VendorRequestStatus = "accept" | "reject" | "pending";

export interface VendorRequest {
  id: number;
  status: VendorRequestStatus;
  createdAt: string;
  user?: User | null;
}
