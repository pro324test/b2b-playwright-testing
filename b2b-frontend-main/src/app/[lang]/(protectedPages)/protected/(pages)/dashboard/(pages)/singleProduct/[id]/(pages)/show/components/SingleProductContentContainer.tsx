"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import { useAppSelector } from "@/redux/config/hooks";
import { Product } from "@/types/ourApiSepecifc/Product";
import React, { useState } from "react";
import ProductVariantSingleTableRow from "../../../components/ProductVariantSingleTableRow";
import CreateProductVariantModal from "@/components/protected/modals/productVariants/CreateProductVariantModal";

type Props = {
  product: Product;
};

export default function SingleProductContentContainer({ product }: Props) {
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const [isCreateProductVariantModalOpen, setIsCreateProductVariantModalOpen] =
    useState(false);

  if (product.shop?.vendor?.id != authEntity?.vendor?.id) {
    return <div>Unauthorized</div>;
  }

  return (
    <>
      <CreateProductVariantModal
        isOpen={isCreateProductVariantModalOpen}
        setIsOpen={setIsCreateProductVariantModalOpen}
        product={product}
      />
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle
          label="Variants Of Product "
          postLabel={
            <span className="text-main-color">&apos;{product.name}&apos;</span>
          }
        />
        <button
          className="bg-green-600 py-2 px-6 text-white transition-colors hover:bg-green-700"
          onClick={() => setIsCreateProductVariantModalOpen(true)}
        >
          Create Variant
        </button>
      </div>
      {product.variants?.length ? (
        <div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>SKU</th>
                <th>Price</th>
                <th>quantity</th>
                <th>Low Stock Threshold</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant) => (
                <ProductVariantSingleTableRow
                  key={variant.id}
                  productVariant={variant}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <NoDataFound />
      )}
    </>
  );
}
