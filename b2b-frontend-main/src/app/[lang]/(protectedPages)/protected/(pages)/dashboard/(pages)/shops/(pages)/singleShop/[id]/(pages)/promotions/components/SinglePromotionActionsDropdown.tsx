"use client";

import React, { useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { useAppSelector } from "@/redux/config/hooks";
import { MdDeleteOutline } from "react-icons/md";
import DeletePromotionModal from "@/components/dashboard/promotions/modals/DeletePromotionModal";
import { Promotion } from "@/types/ourApiSepecifc/Promotion";
import EditPromotionOfBogoSameModal from "@/components/dashboard/promotions/modals/edit/EditPromotionOfBogoSameModal";
import { FaEdit } from "react-icons/fa";
import EditPromotionOfBogoDifferentModal from "@/components/dashboard/promotions/modals/edit/EditPromotionOfBogoDifferentModal";
import EditPromotionOfBuyXToGetYModal from "@/components/dashboard/promotions/modals/edit/EditPromotionOfBuyXToGetYModal";
import EditPromotionOfBogoSameWithVariantsModal from "@/components/dashboard/promotions/modals/edit/EditPromotionOfBogoSameWithVariantsModal";

type Props = {
  promotion: Promotion;
};

export default function SinglePromotionActionsDropdown({ promotion }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isBogoSamePromotion = useRef(
    promotion.type == "bogo_same" &&
      (promotion.bogoRule.applicableVariants == null ||
        promotion.bogoRule.applicableVariants == undefined ||
        promotion.bogoRule.applicableVariants.length == 0)
  );
  const isBogoSameWithVariantsPromotion = useRef(
    promotion.type == "bogo_same" &&
      promotion.bogoRule.applicableVariants != null &&
      promotion.bogoRule.applicableVariants != undefined &&
      promotion.bogoRule.applicableVariants.length > 0
  );
  const isBogoDifferentPromotion = useRef(promotion.type == "bogo_different");
  const isBuyXToGetYPromotion = useRef(
    promotion.type == "buy_x_get_y_discount"
  );

  return (
    <>
      <DeletePromotionModal
        promotion={promotion}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
      {isBogoSamePromotion.current ? (
        <EditPromotionOfBogoSameModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          promotion={promotion}
        />
      ) : (
        ""
      )}
      {isBogoSameWithVariantsPromotion.current ? (
        <EditPromotionOfBogoSameWithVariantsModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          promotion={promotion}
        />
      ) : (
        ""
      )}

      {isBogoDifferentPromotion.current ? (
        <EditPromotionOfBogoDifferentModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          promotion={promotion}
        />
      ) : (
        ""
      )}
      {isBuyXToGetYPromotion.current ? (
        <EditPromotionOfBuyXToGetYModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          promotion={promotion}
        />
      ) : (
        ""
      )}

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
