export type StatusOfCategory = "enabled" | "disabled";

export interface Category {
  id: number;
  name: string;
  description: string;
  status: StatusOfCategory;
  level: number;
  parent?: Category | null;
  children?: Category[] | null;
  _count: Count;
}

export interface Count {
  products: number;
  children: number;
}
