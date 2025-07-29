import { Lang } from "@/types/global/Lang";

export const getCurrentPathnameForDifferentLanguage = ({
  otherLang,
  pathname,
}: {
  otherLang: Lang;
  pathname: string;
}) => {
  const currentPathnameWithDifferentLanguage = `/${otherLang}/${pathname.slice(
    4
  )}`;
  return currentPathnameWithDifferentLanguage;
};
