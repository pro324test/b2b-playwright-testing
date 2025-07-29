import { AttributeValue } from "./AttributeValue";

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  price?: number;
  quantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  attributeValues: AttributeValue[];
}
