import { City } from "./City";

export interface ShopAddress {
  id: number;
  street: string;
  cityId: number;
  city?: City | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsLink?: string | null;
  notes?: string | null;
  shopId: number;
  isDefault: boolean;
}
