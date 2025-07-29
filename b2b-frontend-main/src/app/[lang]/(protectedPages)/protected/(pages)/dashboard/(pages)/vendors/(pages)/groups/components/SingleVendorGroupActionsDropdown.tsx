"use client";

import { TiDocumentDelete } from "react-icons/ti";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { useAppSelector } from "@/redux/config/hooks";
import { MdDeleteOutline } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { VendorGroup } from "@/types/ourApiSepecifc/VendorGroup";
import EditVendorGroupModal from "./modals/EditVendorGroupModal";
import DeleteVendorGroupModal from "./modals/DeleteVendorGroupModal";
import RemoveVendorsFromGroupModal from "./modals/RemoveVendorsFromGroupModal";

type Props = {
  vendorGroup: VendorGroup;
};

export default function SingleVendorGroupActionsDropdown({
  vendorGroup,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRemoveVendorsModalOpen, setIsRemoveVendorsModalOpen] =
    useState(false);
  return (
    <>
      <DeleteVendorGroupModal
        vendorGroup={vendorGroup}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
      <EditVendorGroupModal
        vendorGroup={vendorGroup}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
      />
      <RemoveVendorsFromGroupModal
        vendorGroup={vendorGroup}
        isOpen={isRemoveVendorsModalOpen}
        setIsOpen={setIsRemoveVendorsModalOpen}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="">
          <PiDotsThreeOutlineVerticalFill />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            {dictionary.delete} <MdDeleteOutline />
          </button>
          <DropdownMenuSeparator />
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit <FaEdit />
          </button>
          <DropdownMenuSeparator />
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
            onClick={() => setIsRemoveVendorsModalOpen(true)}
          >
            Remove Vendors <TiDocumentDelete />
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
