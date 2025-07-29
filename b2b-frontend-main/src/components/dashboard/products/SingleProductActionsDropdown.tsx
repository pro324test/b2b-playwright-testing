"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { Product } from "@/types/ourApiSepecifc/Product";
import { IoMdAddCircleOutline } from "react-icons/io";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { FaEdit } from "react-icons/fa";
import CreateProductVariantModal from "@/components/protected/modals/productVariants/CreateProductVariantModal";
import DeleteProductModal from "@/components/dashboard/products/modals/DeleteProductModal";
import { useAppSelector } from "@/redux/config/hooks";
import { MdDeleteOutline, MdOutlineInventory } from "react-icons/md";
import EditProductInventoryModal from "@/components/dashboard/products/modals/EditProductInventoryModal";

type Props = {
  product: Product;
};

export default function SingleProductActionsDropdown({ product }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const [isAddingNewVariantOpen, setIsAddingNewVariantOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditInventoryModalOpen, setIsEditInventoryModalOpen] =
    useState(false);
  return (
    <>
      <CreateProductVariantModal
        isOpen={isAddingNewVariantOpen}
        setIsOpen={setIsAddingNewVariantOpen}
        product={product}
      />
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        product={product}
      />
      <EditProductInventoryModal
        isOpen={isEditInventoryModalOpen}
        setIsOpen={setIsEditInventoryModalOpen}
        product={product}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="">
          <PiDotsThreeOutlineVerticalFill />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuLabel> */}
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-green-600 transition-colors hover:bg-green-600 hover:text-white"
            onClick={() => setIsAddingNewVariantOpen(true)}
          >
            Create Variant <IoMdAddCircleOutline />
          </button>
          <Link
            href={routes.dashboardEditProduct.href({ lang, id: product.id })}
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
          >
            Edit <FaEdit />
          </Link>
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            {dictionary.delete} <MdDeleteOutline />
          </button>
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-yellow-600 transition-colors hover:bg-yellow-600 hover:text-white"
            onClick={() => setIsEditInventoryModalOpen(true)}
          >
            Edit Inventory <MdOutlineInventory />
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
