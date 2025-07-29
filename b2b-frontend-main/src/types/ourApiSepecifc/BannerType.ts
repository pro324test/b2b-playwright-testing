export interface BannerType {
  id: number;
  name: string;
  description: string;
  status: "active" | "inactive";
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}
