import { Vendor } from "../ourApiSepecifc/Vendor";

export type RoleOfAuthEntity = "user" | "admin" | "superadmin" | "vendor";

export interface AuthEntity {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: RoleOfAuthEntity;
  vendor?: Vendor | null;
}
