"use client";

import { ProductVariant } from "@/types/ourApiSepecifc/ProductVariant";
import React from "react";
import SingleProductVariantActionsDropdown from "./SingleProductVariantActionsDropdown";

type Props = {
  productVariant: ProductVariant;
};

export default function ProductVariantSingleTableRow({
  productVariant,
}: Props) {
  return (
    <>
      <tr>
        <td>{productVariant.id}</td>
        <td>{productVariant.sku}</td>
        <td>{productVariant.price}</td>
        <td>{productVariant.quantity}</td>
        <td>{productVariant.lowStockThreshold}</td>
        <td>
          <SingleProductVariantActionsDropdown
            productVariant={productVariant}
          />
        </td>
      </tr>
    </>
  );
}
