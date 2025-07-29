import { BannerType } from "./BannerType";
import { Shop } from "./Shop";

export interface Banner {
  id: number;
  title: string;
  description: string;
  link?: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  shopId: number;
  imageUrl?: string | null;
  shop?: Shop | null;
  bannerTypeId: number;
  bannerType?: BannerType | null;
  startDate?: string | null;
  endDate?: string | null;
}
