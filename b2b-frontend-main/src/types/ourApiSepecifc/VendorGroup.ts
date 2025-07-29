import { Vendor } from "./Vendor";

export interface VendorGroup {
  id: number;
  name: string;
  description: string;
  status: string;
  vendors?: Vendor[] | null;
}
