import { CartItem } from "./CartItem";
import { PaymentInOrder } from "./PaymentInOrder";
import { Shop } from "./Shop";

export type OrderStatusValue =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatusValue;
  items: CartItem[];
  shopId: number;
  shop?: Shop | null;
  totalAmount: number;
  createdAt: string;
  payments: PaymentInOrder[];
  totalItemQuantity: number;
}
