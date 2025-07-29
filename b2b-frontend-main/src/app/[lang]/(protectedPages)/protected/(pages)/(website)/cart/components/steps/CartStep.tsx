"use client";

import NoDataFound from "@/components/globals/NoDataFound";
import WebsiteIsLoading from "@/components/loaders/WebsiteIsLoading";
import SingleCartItem from "@/components/protected/cart/SingleCartItem";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import React, { useCallback, useState } from "react";
import styles from "./styles/CartStepStyles.module.css";
import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import { updateCart } from "@/redux/features/cart/cartSlice";
import { cartRequests } from "@/requests/ourApi/cartRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { CheckoutStep } from "../../types/CheckoutStep";

type Props = {
  setActiveStep: React.Dispatch<React.SetStateAction<CheckoutStep>>;
};

export default function CartStep({ setActiveStep }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const { cart, isGettingCartData } = useAppSelector(
    (state) => state.cartSlice
  );
  const privateAxios = usePrivateAxios({});
  const dispatch = useAppDispatch();
  const [isCartDisabledForModification, setIsCartDisabledForModification] =
    useState(false);

  const clearCart = useCallback(async () => {
    setIsCartDisabledForModification(true);
    try {
      const response = await cartRequests.clearCart({ privateAxios });
      toastSuccessMessage({ dictionary, response });
      dispatch(updateCart(response.data));
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsCartDisabledForModification(false);
    }
    // eslint-disable-next-line
  }, []);

  if (isGettingCartData) return <WebsiteIsLoading />;
  if (cart == null || cart.items.length == 0) return <NoDataFound />;

  return (
    <>
      <LoadingWithOverlay isLoading={isCartDisabledForModification} />
      <div className="padding-x py-8">
        <div className="flex gap-8">
          <div className={styles["cart-items-container"]}>
            <h4 className="px-4 font-bold text-2xl flex justify-between">
              <span>{dictionary.cartContent}</span>
              <button className="text-red-600" onClick={clearCart}>
                {dictionary.clearCart}
              </button>
            </h4>
            {cart.items.map((item) => {
              return (
                <SingleCartItem
                  key={item.id + item.quantity}
                  cartItem={item}
                  borderRadiusTheLoader
                />
              );
            })}
          </div>
          <div className={styles["cart-summary-container"]}>
            <div>
              <h4 className="text-2xl font-bold">
                {dictionary.invoiceTotal} ({cart.items.length}{" "}
                {dictionary.piece})
              </h4>
              <div className="p-4 flex flex-col gap-2">
                <p className="flex justify-between">
                  <span>{dictionary.totalItems}:</span>
                  <span>
                    {cart.subtotal} {dictionary.LYD}
                  </span>
                </p>
                <p className="flex justify-between mb-2">
                  <span>{dictionary.couponReductionAmount}:</span>
                  <span>
                    {cart.discount || 0} {dictionary.LYD}
                  </span>
                </p>
                <p className="flex justify-between border-t pt-2 border-t-gray-200 font-bold">
                  <span>{dictionary.totalPrice}:</span>
                  <span>
                    {cart.total} {dictionary.LYD}
                  </span>
                </p>
              </div>
            </div>
            <button
              className={`main-button mt-4`}
              onClick={() => {
                setActiveStep("address");
              }}
            >
              {dictionary.confirmOrder}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
