"use client";

import React from "react";
import styles from "./styles/TopMenuStyles.module.css";
import { FaBars } from "react-icons/fa";
// import LanguageSwitcher from "@/components/buttons/LanguageSwitcher";
import AuthenticatedUserIconWithDropDown from "@/components/protected/AuthenticatedUserIconWithDropDown";
import VendorRequestWithActions from "@/components/protected/VendorRequestWithActions";
import ShopRequestWithAction from "@/components/protected/ShopRequestWithAction";
// import AuthenticatedUserIconWithDropDown from "@/components/layouts/AuthenticatedUserIconWithDropDown";
// import SimpleIconThemeSwitcher from "@/components/buttons/SimpleIconThemeSwitcher";

type Props = {
  setSideMenuIsActive: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DashboardTopMenu({ setSideMenuIsActive }: Props) {
  return (
    <div className={styles["container"]}>
      <div className="flex gap-4 items-center">
        <button
          onClick={() => setSideMenuIsActive((prevState) => !prevState)}
          className="text-2xl"
        >
          <FaBars />
        </button>
      </div>
      <div className="flex items-center gap-6">
        {/* <SimpleIconThemeSwitcher />
        <LanguageSwitcher
          triggerButtonClassNames={styles["language-switcher-button"]}
        /> */}
        <VendorRequestWithActions />
        <ShopRequestWithAction />
        <AuthenticatedUserIconWithDropDown />
      </div>
    </div>
  );
}
