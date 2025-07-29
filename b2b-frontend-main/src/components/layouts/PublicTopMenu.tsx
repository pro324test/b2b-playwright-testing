"use client";

import React from "react";
import AuthenticatedUserIconWithDropDown from "../protected/AuthenticatedUserIconWithDropDown";
import CartButton from "../protected/cart/CartButton";
import { useAppSelector } from "@/redux/config/hooks";
import Image from "next/image";
import { assetsConstants } from "@/constants/assetsConstants";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import LanguageSwitcher from "../buttons/LanguageSwitcher";
import SearchInput from "./PublicLayoutTopMenuComponents/SearchInput";
import FilterPopover from "./PublicLayoutTopMenuComponents/FilterPopover";
import styles from "./styles/PublicTopMenuStyles.module.css";
import { usePathname } from "next/navigation";

export default function PublicTopMenu() {
  const lang = useLang();
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const pathname = usePathname();
  const isHomePage = pathname == routes.home.href({ lang });
  return (
    <>
      <header
        className={`pt-4 flex flex-col gap-4 items-center  bg-color z-[100]`}
      >
        <div className="padding-x flex justify-between items-center w-full">
          <div className="flex gap-4 items-center">
            {authEntity == null ? (
              <>
                <Link
                  className="main-button !py-2"
                  href={routes.userLogin.href({ lang })}
                >
                  {dictionary.login}
                </Link>
              </>
            ) : (
              <>
                <AuthenticatedUserIconWithDropDown />
                <CartButton />
                <Link
                  href={routes.favouriteProducts.href({ lang })}
                  className="relative bg-white p-2 rounded-full"
                >
                  <Image
                    src={assetsConstants.favouriteIcon}
                    alt="favourite"
                    width={25}
                    height={25}
                    className="w-[20px] h-[20px]"
                  />
                </Link>
              </>
            )}
            <Link href={routes.home.href({ lang })} className="font-bold">
              {dictionary.home}
            </Link>
            <Link href={routes.stores.href({ lang })} className="font-bold">
              {dictionary.stores}
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            <p>{dictionary.customerService}</p>
            <p>0911234567</p>
            <p>-</p>
            <p>0921234567</p>
            <LanguageSwitcher />
          </div>
        </div>
        <div
          className={`${styles["search-and-filter-container"]} ${
            isHomePage ? styles["home-page"] : ""
          } pb-4`}
        >
          {/* <Image
            src={assetsConstants.logoWhiteText}
            alt="logo"
            width={2000}
            height={200}
            className="absolute "
          /> */}
          <div className="w-[40%]">
            <SearchInput />
          </div>
          <FilterPopover />
        </div>
      </header>
    </>
  );
}
