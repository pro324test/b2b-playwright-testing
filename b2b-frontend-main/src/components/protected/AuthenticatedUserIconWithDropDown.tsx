"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import styles from "./styles/AuthenticatedUserIconWithDropDownStyles.module.css";
import { logout } from "@/redux/features/auth/authSlice";
import { FaUserLarge } from "react-icons/fa6";
import useWindowWidth from "@/hooks/useWindowWidth";
import { RiArrowDownSFill } from "react-icons/ri";
import { usePathname } from "next/navigation";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import Link from "next/link";

export default function AuthenticatedUserIconWithDropDown() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const lang = useLang();
  const windowWidth = useWindowWidth();
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);

  const isNotDashboard = !pathname.startsWith(
    routes.dashboard.startsWith({ lang })
  );

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className={styles["trigger-button"]}>
          <span className={styles["svg-container"]}>
            <FaUserLarge />
          </span>
          {windowWidth > 767 ? (
            <span
              className={`${styles["username"]} cutted-text`}
              onClick={() => {
                console.log("auth entity", authEntity);
              }}
            >
              {authEntity?.username}
            </span>
          ) : (
            ""
          )}
          <span className={styles["arrow-down-svg"]}>
            <RiArrowDownSFill />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={styles["content-container"]}>
          <DropdownMenuLabel className={`${styles["item"]} w-full p-0`}>
            <p className="py-2 px-2 text-center">{authEntity?.username}</p>
          </DropdownMenuLabel>
          {isNotDashboard ? (
            <>
              <Link href={routes.orders.href({ lang })} className="w-full">
                {dictionary.orders}
              </Link>
              <Link href={routes.dashboard.href({ lang })} className="w-full">
                {dictionary.dashboard}
              </Link>
            </>
          ) : (
            ""
          )}
          {authEntity?.role !== "admin" &&
          authEntity?.role !== "superadmin" &&
          authEntity?.role != "vendor" ? (
            <>
              <Link
                href={routes.becomeAVendor.href({ lang })}
                className="w-full"
              >
                Request to become a vendor
              </Link>
            </>
          ) : (
            ""
          )}
          <DropdownMenuSeparator />

          <button
            onClick={() => {
              dispatch(logout());
              signOut();
            }}
          >
            {dictionary.logout}
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
