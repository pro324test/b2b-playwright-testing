import { City } from "./City";

export interface UserAddress {
  id: number;
  street: string;
  cityId: number;
  city?: City | null;
  latitude?: number | null;
  longitude?: number | null;
  addressType: "home" | string;
  googleMapsLink?: string | null;
  notes?: string | null;
  isDefault: boolean;
}
