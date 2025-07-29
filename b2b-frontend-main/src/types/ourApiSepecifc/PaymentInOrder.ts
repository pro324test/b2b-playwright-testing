export interface PaymentInOrder {
  id: number;
  orderId: number;
  paymentMethod: string;
  amount: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}
