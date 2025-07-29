import { Category } from "./Category";
import { Product } from "./Product";
import { ProductVariant } from "./ProductVariant";
import { Shop } from "./Shop";

export type PromotionTypeValue =
  | "bogo_same"
  | "bogo_different"
  | "buy_x_get_y_discount";

export interface BogoRule {
  buyQuantity: number;
  getQuantity: number;
  maxRedemptionsPerOrder?: number;
  sameProduct: boolean;
  applyToAllVariants: boolean;
  discountPercent: number;
  applicableProducts?: Product[] | null;
  applicableCategories?: Category[] | null;
  freeProductId?: number | null;
  freeProduct?: Product | null;
  applicableVariants?: ProductVariant[] | null;
}

export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  type: PromotionTypeValue;
  shopId: number;
  shop?: Shop;
  startDate?: string | null;
  endDate?: string | null;
  status: "enabled" | "disabled";
  bogoRule: BogoRule;
}
