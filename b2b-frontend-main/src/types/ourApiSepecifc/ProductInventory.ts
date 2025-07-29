export interface ProductInventory {
  id: number;
  productId: number;
  quantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}
