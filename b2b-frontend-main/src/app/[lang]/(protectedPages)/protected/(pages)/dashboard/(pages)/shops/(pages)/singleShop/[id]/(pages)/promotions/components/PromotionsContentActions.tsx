"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shop } from "@/types/ourApiSepecifc/Shop";
import { FaRegPlusSquare } from "react-icons/fa";
import CreatePromotionOfBogoSameModal from "@/components/dashboard/promotions/modals/create/CreatePromotionOfBogoSameModal";
import CreatePromotionOfBogoDifferentModal from "@/components/dashboard/promotions/modals/create/CreatePromotionOfBogoDifferentModal";
import CreatePromotionOfBuyXToGetYModal from "@/components/dashboard/promotions/modals/create/CreatePromotionOfBuyXToGetYModal";
import CreatePromotionOfBogoSameWithVariantsModal from "@/components/dashboard/promotions/modals/create/CreatePromotionOfBogoSameWithVariantsModal";

type Props = {
  shop: Shop;
};

export default function PromotionsContentActions({ shop }: Props) {
  const [isBogoSameModalOpen, setIsBogoSameModalOpen] = useState(false);
  const [isBogoDifferentModalOpen, setIsBogoDifferentModalOpen] =
    useState(false);
  const [isBuyXToGetYModalOpen, setIsBuyXToGetYModalOpen] = useState(false);
  const [isBogoSameWithVariantsModalOpen, setIsBogoSameWithVariantsModalOpen] =
    useState(false);
  return (
    <>
      <CreatePromotionOfBogoSameModal
        isOpen={isBogoSameModalOpen}
        setIsOpen={setIsBogoSameModalOpen}
        shop={shop}
      />
      <CreatePromotionOfBogoDifferentModal
        isOpen={isBogoDifferentModalOpen}
        setIsOpen={setIsBogoDifferentModalOpen}
        shop={shop}
      />
      <CreatePromotionOfBuyXToGetYModal
        isOpen={isBuyXToGetYModalOpen}
        setIsOpen={setIsBuyXToGetYModalOpen}
        shop={shop}
      />
      <CreatePromotionOfBogoSameWithVariantsModal
        isOpen={isBogoSameWithVariantsModalOpen}
        setIsOpen={setIsBogoSameWithVariantsModalOpen}
        shop={shop}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={
            "py-2 px-6 bg-green-600 text-white flex gap-4 justify-center items-center"
          }
        >
          actions
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuLabel> */}
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-green-600 transition-colors hover:bg-green-600 hover:text-white"
            onClick={() => {
              setIsBogoSameModalOpen(true);
            }}
          >
            <span> Create Promotion For Same Products to get free ones </span>
            <FaRegPlusSquare />
          </button>
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
            onClick={() => {
              setIsBogoDifferentModalOpen(true);
            }}
          >
            <span> Create Promotion For Category To Get Free Product </span>
            <FaRegPlusSquare />
          </button>
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-yellow-600 transition-colors hover:bg-yellow-600 hover:text-white"
            onClick={() => {
              setIsBuyXToGetYModalOpen(true);
            }}
          >
            <span>
              {" "}
              Create Promotion to buy products and discount for them{" "}
            </span>
            <FaRegPlusSquare />
          </button>
          <button
            className="w-full px-2 p-1 rounded-md flex justify-between items-center gap-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
            onClick={() => {
              setIsBogoSameWithVariantsModalOpen(true);
            }}
          >
            <span>
              {" "}
              Create Promotion For Same Products to get Variants for free{" "}
            </span>
            <FaRegPlusSquare />
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
