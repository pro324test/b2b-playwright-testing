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
import { ContentManagement } from "@/types/ourApiSepecifc/ContentManagement";
import DeleteContentManagementModal from "./modals/DeleteContentManagementModal";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";

type Props = {
  contentManagement: ContentManagement;
};

export default function SingleContentManagementActionsDropdown({
  contentManagement,
}: Props) {
  const lang = useLang();
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  return (
    <>
      <DeleteContentManagementModal
        contentManagement={contentManagement}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
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
          <Link
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
            href={routes.dashboardEditContentManagement.href({
              lang,
              contentmanagementId: contentManagement.id,
            })}
          >
            Edit <FaEdit />
          </Link>
          {/* </DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
