"use client";

import NoDataFound from "@/components/globals/NoDataFound";
import { Product } from "@/types/ourApiSepecifc/Product";
import React, { useState } from "react";
import ProductVariantSingleTableRow from "../../../../components/ProductVariantSingleTableRow";
import CreateProductVariantModal from "@/components/protected/modals/productVariants/CreateProductVariantModal";

type Props = {
  product: Product;
};

export default function EditProductVariantsTabContent({ product }: Props) {
  const [isCreateNewVariantModalOpen, setIsCreateNewVariantModalOpen] =
    useState(false);

  return (
    <>
      <CreateProductVariantModal
        isOpen={isCreateNewVariantModalOpen}
        setIsOpen={setIsCreateNewVariantModalOpen}
        product={product}
      />
      <div className="my-8">
        <button
          className="bg-green-600 py-2 px-6 text-white transition-colors hover:bg-green-700"
          onClick={() => {
            setIsCreateNewVariantModalOpen(true);
          }}
        >
          Add New Variant
        </button>
      </div>
      {product.variants == null || product.variants.length === 0 ? (
        <NoDataFound
          additionalTextAfterSorryWeDidNotFindAnyPrefix="Variants"
          showPreviousPageLink={false}
        />
      ) : (
        <>
          <table className="custom-table">
            <thead>
              <tr>
                <th>id</th>
                <th>SKU</th>
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
        </>
      )}
    </>
  );
}
