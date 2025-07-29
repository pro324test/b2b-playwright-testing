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
import DeleteBannerModal from "@/components/dashboard/banners/modals/DeleteBannerModal";
import { Banner } from "@/types/ourApiSepecifc/Banner";
import EditBannerModal from "@/components/dashboard/banners/modals/EditBannerModal";

type Props = {
  banner: Banner;
};

export default function SingleBannerActionsDropdown({ banner }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  return (
    <>
      <DeleteBannerModal
        banner={banner}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
      <EditBannerModal
        banner={banner}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="">
          <PiDotsThreeOutlineVerticalFill />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuLabel> */}
          {authEntity?.role == "user" ? (
            ""
          ) : (
            <>
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
            </>
          )}
          {/* </DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
