"use client";

import { usePathname } from "next/navigation";
import { Lang } from "@/types/global/Lang";

export default function useLang() {
  const pathname = usePathname();
  const lang = pathname.slice(1, 3) as Lang;
  return lang;
}
