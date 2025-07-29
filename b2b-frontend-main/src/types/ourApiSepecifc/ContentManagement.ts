export interface ContentManagement {
  id: number;
  title: string;
  description: string;
  isPublished: boolean;
  typeId: number;
  link?: string | null;
  backgroundColor?: string | null;
  images?: { id: number; imageUrl: string }[] | null;
}
