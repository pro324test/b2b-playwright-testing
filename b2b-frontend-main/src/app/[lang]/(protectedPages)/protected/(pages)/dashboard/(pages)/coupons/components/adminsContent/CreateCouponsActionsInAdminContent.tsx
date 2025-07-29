"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { FaRegPlusSquare } from "react-icons/fa";
import { ManageCouponModalType } from "@/types/app_specific/coupons/ManageCouponModalType";
import CreateCouponModal from "@/components/dashboard/coupons/modals/CreateCouponModal";
import { Vendor } from "@/types/ourApiSepecifc/Vendor";
import SelectVendorToActInBehalfOfModal from "./SelectVendorToActInBehalfOfModal";

export default function CreateCouponsActionsInAdminContent() {
  const [isCreatingCouponModalOpen, setIsCreatingCouponModalOpen] =
    useState(false);
  const [isChoosingVendorModalOpen, setIsChoosingVendorModalOpen] =
    useState(false);
  const [typeOfCreation, setTypeOfCreation] =
    useState<ManageCouponModalType>("multiple_shops");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  return (
    <>
      <CreateCouponModal
        isOpen={isCreatingCouponModalOpen}
        setIsOpen={setIsCreatingCouponModalOpen}
        typeOfCreation={typeOfCreation}
        vendor={selectedVendor ?? undefined}
        key={selectedVendor?.id}
      />
      <SelectVendorToActInBehalfOfModal
        isOpen={isChoosingVendorModalOpen}
        setIsOpen={setIsChoosingVendorModalOpen}
        onSubmitSelectingVendor={(vendor) => {
          setSelectedVendor(vendor);
          setIsCreatingCouponModalOpen(true);
        }}
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
              setIsChoosingVendorModalOpen(true);
            }}
          >
            Create Coupon For Multiple Shops
          </button>
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
            onClick={() => {
              setTypeOfCreation("multiple_categories");
              setIsChoosingVendorModalOpen(true);
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
