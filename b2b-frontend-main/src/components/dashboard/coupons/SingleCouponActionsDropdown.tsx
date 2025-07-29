"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { useAppSelector } from "@/redux/config/hooks";
import { MdDeleteOutline } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import DeleteCouponModal from "./modals/DeleteCouponModal";
import { Coupon } from "@/types/ourApiSepecifc/Coupon";
import EditCouponModal from "./modals/EditCouponModal";

type Props = {
  coupon: Coupon;
};

export default function SingleCouponActionsDropdown({ coupon }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  return (
    <>
      <DeleteCouponModal
        coupon={coupon}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
      <EditCouponModal
        coupon={coupon}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        vendor={coupon.vendor}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="">
          <PiDotsThreeOutlineVerticalFill />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuLabel> */}
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            {dictionary.delete} <MdDeleteOutline />
          </button>
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit <FaEdit />
          </button>
          {/* </DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
