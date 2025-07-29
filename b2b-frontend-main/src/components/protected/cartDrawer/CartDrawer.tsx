"use client";

import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Product } from "@/types/ourApiSepecifc/Product";
import styles from "./styles/CartDrawerStyles.module.css";

import React, { useCallback, useState } from "react";
import { ProductVariant } from "@/types/ourApiSepecifc/ProductVariant";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { AxiosResponse } from "axios";
import { Cart } from "@/types/ourApiSepecifc/Cart";
import { cartRequests } from "@/requests/ourApi/cartRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { updateCart } from "@/redux/features/cart/cartSlice";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";

type Props = {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  product: Product;
};

export default function CartDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  product,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const websiteDirection = useWebsiteDirection();
  const privateAxios = usePrivateAxios({});
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  const addProductToCart = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response: AxiosResponse<Cart> = await cartRequests.addItemToCart({
        privateAxios,
        data,
      });
      toastSuccessMessage({ dictionary, response });
      dispatch(updateCart(response.data));
      setIsDrawerOpen(false);
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className={styles["drawer-content"]}>
          <div className="p-4 h-full min-h-[35vh] flex flex-col ">
            <DrawerTitle className="text-center mb-8">
              Choose a variant for {product.name}
            </DrawerTitle>
            <div className="flex gap-4 flex-wrap">
              {product.variants?.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    // className="bg-gray-100 p-2 px-4 rounded-md flex flex-col gap-2"
                    className={`${styles["single-variant-button"]} ${
                      isSelected ? styles["active"] : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariant(variant);
                    }}
                  >
                    <span className="flex gap-2">
                      {variant.attributeValues.map((attributeValue, index) => {
                        return (
                          <span
                            key={attributeValue.id}
                            className="flex items-center"
                          >
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
                      {variant.price || product.basePrice} {dictionary.LYD}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              className={`${styles["add-to-cart-button-full"]} !mt-auto`}
              disabled={!selectedVariant}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isLoading) return;
                if (!selectedVariant) return;
                addProductToCart({
                  productId: product.id,
                  variantId: selectedVariant.id,
                  quantity: 1,
                });
              }}
            >
              {isLoading ? <IphoneLoader /> : dictionary.addToCart}
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
