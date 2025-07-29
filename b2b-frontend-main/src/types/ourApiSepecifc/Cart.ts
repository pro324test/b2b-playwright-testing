import { CartItem } from "./CartItem";

export interface Cart {
  id: number;
  userId: number;
  isCheckedOut: boolean;
  appliedCouponCode: string | null;
  couponDiscount: number | null;
  items: CartItem[];
  subtotal: number | null;
  discount: number | null;
  total: number;
}
