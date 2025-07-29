"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/redux/config/hooks";

import { FaRegPlusSquare } from "react-icons/fa";
import { ManageCouponModalType } from "@/types/app_specific/coupons/ManageCouponModalType";
import CreateCouponModal from "@/components/dashboard/coupons/modals/CreateCouponModal";

export default function CreateCouponsActionsInVendorContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [typeOfCreation, setTypeOfCreation] =
    useState<ManageCouponModalType>("multiple_shops");
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  return (
    <>
      <CreateCouponModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        typeOfCreation={typeOfCreation}
        vendor={authEntity?.vendor ?? undefined}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={
            "py-2 px-6 bg-green-600 text-white flex gap-4 justify-center items-center"
          }
        >
          <FaRegPlusSquare />

          <span> Create Coupon</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuLabel> */}
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
            onClick={() => {
              setTypeOfCreation("multiple_shops");
              setIsOpen(true);
            }}
          >
            Create Coupon For Multiple Shops
          </button>
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
            onClick={() => {
              setTypeOfCreation("multiple_categories");
              setIsOpen(true);
            }}
          >
            Create Coupon For Multiple Categories
          </button>
          {/* </DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
