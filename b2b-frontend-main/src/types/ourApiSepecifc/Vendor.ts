import { Shop } from "./Shop";
import { User } from "./User";
import { VendorGroup } from "./VendorGroup";

export interface Vendor {
  id: number;
  userId: number;
  isDisabled: boolean;
  user?: User | null;
  shops?: Shop[] | null;
  groups?: VendorGroup[] | null;
}
