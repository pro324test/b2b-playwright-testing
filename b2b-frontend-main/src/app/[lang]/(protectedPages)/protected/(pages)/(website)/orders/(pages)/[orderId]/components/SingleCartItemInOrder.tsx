"use client";

import Divider from "@/components/globals/Divider";
import { assetsConstants } from "@/constants/assetsConstants";
import { CartItem } from "@/types/ourApiSepecifc/CartItem";
import { formatFileUrl } from "@/utils/formatFileUrl";
import Image from "next/image";
import React from "react";

type Props = {
  item: CartItem;
  isLastItem: boolean;
};

export default function SingleCartItemInOrder({ item, isLastItem }: Props) {
  return (
    <div key={item.id}>
      <div className="flex gap-4 justify-between mb-4">
        <div className="flex gap-4">
          <div className="rounded-md overflow-hidden">
            <Image
              src={
                item.product.images?.length
                  ? formatFileUrl(item.product.images[0].path)
                  : assetsConstants.defaultImage
              }
              alt="product"
              width={150}
              height={150}
            />
          </div>
          <div>
            <p>{item.product.name}</p>
            <p>Quantity: {item.quantity}</p>
          </div>
        </div>
        <div>
          {item.discounts?.map((discount) => {
            return (
              <span
                className="line-through text-red-500 text-sm"
                key={discount.promotionId}
              >
                {discount.discountAmount} LYD
              </span>
            );
          })}
          <p>{item.finalPrice} LYD</p>
        </div>
      </div>
      {!isLastItem ? <Divider classNames="my-4" /> : ""}
    </div>
  );
}
