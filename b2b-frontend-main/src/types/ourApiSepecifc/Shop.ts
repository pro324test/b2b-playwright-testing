import { Vendor } from "./Vendor";

export type ShopStatus = "enabled" | "disabled" | "pending" | "rejected";

export interface Shop {
  id: number;
  name: string;
  description: string;
  status: ShopStatus;
  logoUrl: string | null;
  vendor?: Vendor | null;
}
