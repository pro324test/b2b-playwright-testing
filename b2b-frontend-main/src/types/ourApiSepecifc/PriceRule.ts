import { Product } from "./Product";
import { ProductVariant } from "./ProductVariant";
import { Shop } from "./Shop";
import { Vendor } from "./Vendor";
import { VendorGroup } from "./VendorGroup";

export type PriceRuleTypeValue = "discount" | "fixed_price";

export interface PriceRule {
  id: number;
  name: string;
  type: PriceRuleTypeValue;
  value: string;
  minQuantity: number;
  maxQuantity: null | number;
  startDate: string | null;
  endDate: string | null;
  status: "enabled" | "disabled";
  vendorGroupId: null | number;
  createdAt: string;
  updatedAt: string;
  vendorGroup?: VendorGroup | null;
  products?: Product[] | null;
  variants?: ProductVariant[] | null;
  shops?: Shop[] | null;
  vendor?: Vendor | null;
}
