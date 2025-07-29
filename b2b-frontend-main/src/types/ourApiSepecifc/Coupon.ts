import { Category } from "./Category";
import { Product } from "./Product";
import { Shop } from "./Shop";
import { Vendor } from "./Vendor";

export type CouponTypeValue = "percentage" | "fixed" | "free_shipping";
export interface Coupon {
  id: number;
  code: string;
  type: CouponTypeValue;
  status: "enabled" | "disabled";
  value: string;
  minOrderAmount: string;
  maxDiscountAmount?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  description: string | null;
  shops?: Shop[] | null;
  applicableProducts?: Product[] | null;
  applicableCategories?: Category[] | null;
  vendor: Vendor;
}
