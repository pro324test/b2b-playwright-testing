"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { Shop } from "@/types/ourApiSepecifc/Shop";
import EditShopModal from "./modals/EditShopModal";
import { FaEdit } from "react-icons/fa";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";

type Props = {
  shop: Shop;
  isMyShop?: boolean;
};

export default function SingleShopActionsDropdown({ shop, isMyShop }: Props) {
  const lang = useLang();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  return (
    <>
      <EditShopModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        shop={shop}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="">
          <PiDotsThreeOutlineVerticalFill />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuLabel> */}
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit <FaEdit />
          </button>
          {isMyShop ? (
            <>
              <Link
                className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-green-600 transition-colors hover:bg-green-600 hover:text-white"
                href={routes.dashboardSingleShop.href({ lang, id: shop.id })}
              >
                Products
              </Link>
              <Link
                className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-yellow-600 transition-colors hover:bg-yellow-600 hover:text-white"
                href={routes.dashboardSingleShopBanners.href({
                  lang,
                  id: shop.id,
                })}
              >
                Banners
              </Link>
              <Link
                className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-sky-600 transition-colors hover:bg-sky-600 hover:text-white"
                href={routes.dashboardSingleShopPromotions.href({
                  lang,
                  id: shop.id,
                })}
              >
                Promotions
              </Link>
              <Link
                className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-yellow-600 transition-colors hover:bg-yellow-600 hover:text-white"
                href={routes.dashboardSingleShopAddresses.href({
                  lang,
                  id: shop.id,
                })}
              >
                Addresses
              </Link>
              <Link
                className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                href={routes.dashboardSingleShopCoupons.href({
                  lang,
                  id: shop.id,
                })}
              >
                Coupons
              </Link>
            </>
          ) : (
            ""
          )}
          {/* </DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
