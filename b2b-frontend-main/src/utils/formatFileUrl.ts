import { backendBaseUrl } from "@/constants/ourApiConstants";

export function formatFileUrl(path: string): string {
  return `${backendBaseUrl}${path}`;
}
