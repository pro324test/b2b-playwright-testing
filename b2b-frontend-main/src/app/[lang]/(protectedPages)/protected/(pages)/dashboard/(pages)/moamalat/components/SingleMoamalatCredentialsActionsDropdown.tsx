"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { FaEdit } from "react-icons/fa";
import { MoamalatCredentials } from "@/types/ourApiSepecifc/MoamalatCredentials";
import EditMoamalatCredentialsModal from "./modals/EditMoamalatCredentialsModal";

type Props = {
  moamalatCredentials: MoamalatCredentials;
};

export default function SingleMoamalatCredentialsActionsDropdown({
  moamalatCredentials,
}: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  return (
    <>
      <EditMoamalatCredentialsModal
        moamalatCredentials={moamalatCredentials}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
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
          {/* </DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
