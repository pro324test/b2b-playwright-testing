"use client";

import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import { cartRequests } from "@/requests/ourApi/cartRequests";
import { Cart } from "@/types/ourApiSepecifc/Cart";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SingleCartItem from "@/components/protected/cart/SingleCartItem";
import { AxiosResponse } from "axios";
import {
  setIsGettingCartData,
  updateCart,
} from "@/redux/features/cart/cartSlice";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import styles from "./styles/CartButtonStyles.module.css";
import CouponActionsInCart from "./CouponActionsInCart";
import Image from "next/image";
import { assetsConstants } from "@/constants/assetsConstants";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";

export default function CartButton() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const router = useRouter();
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
      dispatch(updateCart(response.data));
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsCartDisabledForModification(false);
    }
    // eslint-disable-next-line
  }, []);

  // const checkoutHandler = useCallback(async (data: object) => {
  //   setIsCartDisabledForModification(true);
  //   try {
  //     // const response = await cartRequests.checkout({ privateAxios, data });
  //     const response = await cartRequests.checkout({ privateAxios, data });
  //     dispatch(updateCart(response.data));
  //   } catch (error) {
  //     extractErrorAndToastIt({ error, dictionary });
  //   } finally {
  //     setIsCartDisabledForModification(false);
  //   }
  //   // eslint-disable-next-line
  // }, []);

  useEffect(() => {
    async function getCart() {
      try {
        dispatch(setIsGettingCartData(true));
        const response: AxiosResponse<Cart> =
          await cartRequests.getCurrentUserCart({
            privateAxios,
          });
        dispatch(updateCart(response.data));
      } catch (error: any) {
        const status = error?.response?.data?.statusCode;
        if (status === 404) {
          return;
        }
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        dispatch(setIsGettingCartData(false));
      }
    }
    getCart();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Popover>
        <PopoverTrigger className={styles["cart-button"]}>
          <div className="bg-white p-2 relative rounded-[50%]">
            <Image
              src={assetsConstants.cartIcon}
              alt="cart"
              width={25}
              height={25}
              className="w-[20px] h-[20px]"
            />
            {cart != null && cart.items.length > 0 ? (
              <span className={styles["items-count"]}>
                {cart?.items.length}
              </span>
            ) : (
              ""
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[50vw] md:w-[500px] mx-4 p-0 z-[200]">
          {isGettingCartData ? (
            <div className="flex justify-center items-center p-4">
              <IphoneLoader />
            </div>
          ) : cart == null || cart.items.length == 0 ? (
            <p className="text-center p-4">No Cart Items </p>
          ) : (
            <>
              <div className={styles["cart-with-items-content-container"]}>
                {isCartDisabledForModification ? (
                  <div className={styles["is-clearing-cart-loading-div"]}>
                    <IphoneLoader />
                  </div>
                ) : (
                  ""
                )}
                <div className="p-4 flex justify-between border-b border-b-gray-200">
                  <p>{dictionary.cartContent}</p>
                  <button
                    className="font-bold text-red-500 transition-colors hover:text-red-700"
                    onClick={() => clearCart()}
                  >
                    {dictionary.clearCart}
                  </button>
                </div>
                {cart.items.map((cartItem) => (
                  <SingleCartItem
                    key={cartItem.id + cartItem.quantity}
                    cartItem={cartItem}
                  />
                ))}

                <CouponActionsInCart />

                <div className="p-4 flex flex-col gap-2 border-t border-t-gray-200">
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
                <div className="p-4">
                  <button
                    className="w-full bg-main-color text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      // const data = {
                      //   shopId: 1,
                      //   paymentMethod: "cod",
                      // };
                      // checkoutHandler(data);
                      router.push(routes.cart.href({ lang }));
                    }}
                  >
                    {dictionary.checkout}
                  </button>
                </div>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}
