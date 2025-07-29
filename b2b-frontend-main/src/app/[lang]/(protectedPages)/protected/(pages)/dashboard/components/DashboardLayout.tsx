"use client";

import React, { useEffect, useState } from "react";
import styles from "./styles/DashboardLayoutStyle.module.css";
import useWindowWidth from "@/hooks/useWindowWidth";
import DashboardSideMenu from "./DashboardSideMenu";
import DashboardTopMenu from "./DashboardTopMenu";

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const windowWidth = useWindowWidth();
  const [sideMenuIsActive, setSideMenuIsActive] = useState(
    windowWidth < 768 ? false : true
  );

  useEffect(() => {
    document.documentElement.classList.add("dashboard");
    if (sideMenuIsActive && windowWidth < 768) {
      document.documentElement.classList.add("overflow-hidden");
    } else {
      document.documentElement.classList.remove("overflow-hidden");
    }
    return () => {
      document.documentElement.classList.remove("dashboard");
    };
  }, [sideMenuIsActive, windowWidth]);
  return (
    <>
      <div className={styles["container"]}>
        <DashboardSideMenu
          isActive={sideMenuIsActive}
          setIsActive={setSideMenuIsActive}
        />

        <div
          className={`${styles["top-menu-and-content-container"]} ${
            sideMenuIsActive
              ? styles["side-menu-is-active"]
              : styles["side-menu-is-not-active"]
          }`}
        >
          <DashboardTopMenu setSideMenuIsActive={setSideMenuIsActive} />
          <div className={styles["content-container"]}>{children}</div>
        </div>
      </div>
    </>
  );
}
