"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { FaEdit } from "react-icons/fa";
import { Category } from "@/types/ourApiSepecifc/Category";
import EditCategoryModaal from "./modals/EditCategoryModal";
import DeleteCategoryModal from "./modals/DeleteCategoryModal";
import { useAppSelector } from "@/redux/config/hooks";
import { MdDeleteOutline } from "react-icons/md";

type Props = {
  category: Category;
};

export default function SingleCategoryActionsDropdown({ category }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  return (
    <>
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        category={category}
      />
      <EditCategoryModaal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        category={category}
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
