"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useLang from "@/hooks/useLang";
import styles from "./styles/LanguageSwitcherStyles.module.css";
import { usePathname, useRouter } from "next/navigation";
import { Lang } from "@/types/global/Lang";
import Image from "next/image";
import { getCurrentPathnameForDifferentLanguage } from "@/utils/getCurrentPathnameForDifferentLanguage";
import { assetsConstants } from "@/constants/assetsConstants";
type Props = {
  triggerButtonClassNames?: string;
};

export default function LanguageSwitcher({ triggerButtonClassNames }: Props) {
  const lang = useLang();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (otherLang: Lang) => {
    const currentPathnameWithDifferentLanguage =
      getCurrentPathnameForDifferentLanguage({ otherLang, pathname });
    router.replace(currentPathnameWithDifferentLanguage);
  };
  const currentLangData: { flag: string; label: string } =
    lang == "ar"
      ? { flag: assetsConstants.libyaFlagIcon, label: "العربية" }
      : { flag: assetsConstants.englishFlagIcon, label: "EN" };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`${styles["trigger-button"]} ${
            triggerButtonClassNames || ""
          } flex gap-2 items-center`}
        >
          {/* <AiOutlineGlobal /> */}
          <Image src={currentLangData.flag} alt="flag" width={25} height={25} />
          <span>{currentLangData.label}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mx-2 z-index-9000">
          <DropdownMenuItem
            onClick={() => {
              changeLanguage("ar");
            }}
            disabled={lang == "ar"}
            className={`${styles["lang-item"]} ${
              lang == "ar" ? styles["active"] : ""
            }`}
          >
            <span>العربية</span>
            <Image
              src={assetsConstants.libyaFlagIcon}
              alt="العربية"
              width={20}
              height={20}
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              changeLanguage("en");
            }}
            disabled={lang == "en"}
            className={`${styles["lang-item"]} ${
              lang == "en" ? styles["active"] : ""
            }`}
          >
            <span>English</span>
            <Image
              src={assetsConstants.englishFlagIcon}
              alt="en"
              width={20}
              height={20}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
