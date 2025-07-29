"use client";

import { ProductVariant } from "@/types/ourApiSepecifc/ProductVariant";
import React from "react";
import styles from "./styles/SingleProductVariantsStyles.module.css";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import { useAppSelector } from "@/redux/config/hooks";

type Props = {
  variants: ProductVariant[];
  productBasePrice: string;
  selectedVariant: ProductVariant | null;
  setSelectedVariant: React.Dispatch<
    React.SetStateAction<ProductVariant | null>
  >;
};

export default function SingleProductVariantsContent({
  variants,
  productBasePrice,
  selectedVariant,
  setSelectedVariant,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const websiteDirection = useWebsiteDirection();
  return (
    <>
      {/* <div className="mb-4"></div> */}
      {/* <Divider /> */}
      <div className="my-8 flex gap-4 flex-wrap">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          return (
            <button
              key={variant.id}
              // className="bg-gray-100 p-2 px-4 rounded-md flex flex-col gap-2"
              className={`${styles["single-variant-button"]} ${
                isSelected ? styles["active"] : ""
              }`}
              onClick={() => {
                setSelectedVariant(variant);
              }}
            >
              <span className="flex gap-2">
                {variant.attributeValues.map((attributeValue, index) => {
                  return (
                    <span key={attributeValue.id} className="flex items-center">
                      <span className="flex gap-2">
                        <span>{attributeValue.attribute?.name}: </span>
                        <span>{attributeValue.value}</span>
                      </span>
                      {attributeValue.hexValue ? (
                        <span
                          className="w-5 h-5 rounded-full inline-block ml-2"
                          style={{
                            backgroundColor: attributeValue.hexValue,
                          }}
                        ></span>
                      ) : (
                        ""
                      )}
                      {index !== variant.attributeValues.length - 1 ? (
                        <span
                          className={
                            websiteDirection == "ltr" ? "ml-2" : "mr-2"
                          }
                        >
                          {" "}
                          |
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  );
                })}
              </span>
              <span className="font-bold">
                {variant.price || productBasePrice} {dictionary.LYD}
              </span>
            </button>
          );
        })}
      </div>
      {/* <Divider /> */}
    </>
  );
}
