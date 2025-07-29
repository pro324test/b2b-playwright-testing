"use client";

import useWebsiteDirection from "./useWebsiteDirection";

export default function useStandardLang() {
  const websiteDirection = useWebsiteDirection();
  const standardLang = websiteDirection == "ltr" ? "en" : "ar";
  return standardLang;
}
