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
import { Attribute } from "@/types/ourApiSepecifc/Attribute";
import DeleteAttributeModal from "./modals/DeleteAttributeModal";
import EditAttributeModaal from "./modals/EditAttributeModal";
import { FaEdit } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import AddNewValueToAttributeModal from "./modals/AddNewValueToAttributeModal";

type Props = {
  attribute: Attribute;
};

export default function SingleAttributeActionsDropdown({ attribute }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddNewValueModalOpen, setIsAddNewValueModalOpen] = useState(false);
  return (
    <>
      <DeleteAttributeModal
        attribute={attribute}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
      <EditAttributeModaal
        attribute={attribute}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
      />
      <AddNewValueToAttributeModal
        attribute={attribute}
        isOpen={isAddNewValueModalOpen}
        setIsOpen={setIsAddNewValueModalOpen}
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
              <button
                className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-green-600 transition-colors hover:bg-green-600 hover:text-white"
                onClick={() => setIsAddNewValueModalOpen(true)}
              >
                Add New Value <IoMdAddCircleOutline />
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
