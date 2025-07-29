import { Vendor } from "./Vendor";

export type ShopRequestStatus = "accept" | "reject" | "pending";

export interface ShopRequest {
  id: number;
  name: string;
  description: string;
  logoUrl: string | null;
  status: ShopRequestStatus;
  vendorId: number;
  createdAt: string | null;
  respondedAt: string | null;
  vendor?: Vendor | null;
}
