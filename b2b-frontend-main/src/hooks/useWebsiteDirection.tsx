"use client";

import useLang from "./useLang";

export default function useWebsiteDirection() {
  const lang = useLang();
  const direction = lang == "ar" ? "rtl" : "ltr";
  return direction;
}
