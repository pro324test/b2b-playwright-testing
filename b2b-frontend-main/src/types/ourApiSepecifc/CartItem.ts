import { Product } from "./Product";
import { ProductVariant } from "./ProductVariant";
import { PromotionTypeValue } from "./Promotion";

interface CartItemDiscount {
  promotionId: number;
  promotionName: string;
  type: PromotionTypeValue;
  discountedQuantity: number;
  discountAmount: number;
  discountPercent: number;
}

export interface CartItem {
  id: number;
  productId: number;
  variantId?: number | null;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  hasPromotion: boolean;
  product: Product;
  variant?: ProductVariant | null;
  discounts: CartItemDiscount[] | null;
}
