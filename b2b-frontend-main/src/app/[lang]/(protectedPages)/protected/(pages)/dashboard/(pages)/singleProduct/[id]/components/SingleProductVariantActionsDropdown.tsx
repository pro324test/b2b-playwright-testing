"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import EditProductVariantModal from "./modal/EditProductVariantModal";
import { ProductVariant } from "@/types/ourApiSepecifc/ProductVariant";
import { FaEdit } from "react-icons/fa";
import DeleteProductVariantModal from "./modal/DeleteProductVariantModal";
import { useAppSelector } from "@/redux/config/hooks";
import { MdDeleteOutline } from "react-icons/md";
import { GiPriceTag } from "react-icons/gi";
import CreatePriceRuleModal from "@/components/dashboard/priceRules/modals/CreatePriceRuleModal";

type Props = {
  productVariant: ProductVariant;
};

export default function SingleProductVariantActionsDropdown({
  productVariant,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddNewPriceRuleModalOpen, setIsAddNewPriceRuleModalOpen] =
    useState(false);
  return (
    <>
      <EditProductVariantModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        productVariant={productVariant}
      />
      <DeleteProductVariantModal
        productVariant={productVariant}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
      <CreatePriceRuleModal
        isOpen={isAddNewPriceRuleModalOpen}
        setIsOpen={setIsAddNewPriceRuleModalOpen}
        productVariant={productVariant}
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
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            {dictionary.delete} <MdDeleteOutline />
          </button>
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-yellow-600 transition-colors hover:bg-yellow-600 hover:text-white"
            onClick={() => setIsAddNewPriceRuleModalOpen(true)}
          >
            Add New Price Rule <GiPriceTag />
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
