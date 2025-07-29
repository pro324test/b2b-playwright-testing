"use client";

import React from "react";
import styles from "./styles/SideMenuStyles.module.css";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import SideMenuLinksContainer from "./SideMenuLinksContainer";

type Props = {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DashboardSideMenu({ isActive, setIsActive }: Props) {
  const lang = useLang();
  return (
    <>
      <aside
        className={`${styles["container"]} ${
          isActive ? styles["is-active"] : styles["not-active"]
        }`}
      >
        <div className={styles["img-div"]}>
          <Link href={routes.home.href({ lang })}>
            {/* <Image
              className="w-[175px] mt-[2px]"
              src={assetsConstants.logo}
              alt="Logo"
              width={200}
              height={200}
            /> */}
            B2b Business to Business Logo
          </Link>
        </div>
        <SideMenuLinksContainer setIsSideMenuActive={setIsActive} />
      </aside>
      {/* backdrop for mobile screen */}
      <div
        className={styles["backdrop"]}
        onClick={() => setIsActive(false)}
      ></div>
    </>
  );
}
