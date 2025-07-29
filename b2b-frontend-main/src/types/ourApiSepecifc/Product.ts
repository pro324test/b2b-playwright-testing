import { Brand } from "./Brand";
import { Category } from "./Category";
import { PriceRule } from "./PriceRule";
import { ProductImage } from "./ProductImage";
import { ProductInventory } from "./ProductInventory";
import { ProductVariant } from "./ProductVariant";
import { Shop } from "./Shop";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  basePrice: string;
  shopId: number;
  shop?: Shop | null;
  status: "enabled" | "disabled";
  categories?: Category[] | null;
  brand?: Brand | null;
  images?: ProductImage[] | null;
  variants?: ProductVariant[] | null;
  inventory?: ProductInventory | null;
  priceRules?: PriceRule[] | null;
}
