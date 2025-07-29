import { User } from "./User";

export interface Review {
  id: number;
  rating: number;
  title: string;
  content: string;
  userId: number;
  user?: User | null;
  images?:
    | {
        id: number;
        imageUrl: string;
      }[]
    | null;
}
