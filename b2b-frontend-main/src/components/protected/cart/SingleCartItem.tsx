"use client";

import { assetsConstants } from "@/constants/assetsConstants";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import { CartItem } from "@/types/ourApiSepecifc/CartItem";
import { formatFileUrl } from "@/utils/formatFileUrl";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./styles/SingleCartItemStyles.module.css";
import { cartRequests } from "@/requests/ourApi/cartRequests";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { AxiosResponse } from "axios";
import { Cart } from "@/types/ourApiSepecifc/Cart";
import { updateCart } from "@/redux/features/cart/cartSlice";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { MdDelete } from "react-icons/md";
import { Input } from "@/components/ui/input";

type Props = {
  cartItem: CartItem;
  borderRadiusTheLoader?: boolean;
};

export default function SingleCartItem({
  cartItem,
  borderRadiusTheLoader,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const imageUrl = useRef(
    cartItem.product?.images?.length
      ? formatFileUrl(cartItem.product.images[0].path)
      : assetsConstants.defaultImage
  );
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(cartItem.quantity);
  const [isLoading, setIsLoading] = useState(false);
  const updateCartQuantity = useCallback(async (newQuantity: number) => {
    try {
      setIsLoading(true);
      const response: AxiosResponse<Cart> =
        await cartRequests.updateItemQuantity({
          privateAxios,
          data: { quantity: newQuantity },
          cartItemId: cartItem.id,
        });
      toastSuccessMessage({ dictionary, response });
      dispatch(updateCart(response.data));
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
      setQuantity(cartItem.quantity);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const deleteCartItem = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await cartRequests.removeItemFromCart({
        privateAxios,
        cartItemId: cartItem.id,
      });
      toastSuccessMessage({ dictionary, response });
      dispatch(updateCart(response.data));
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (quantity !== cartItem.quantity) {
        updateCartQuantity(quantity);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line
  }, [quantity]);

  return (
    <div className={styles["outer-container"]}>
      {isLoading ? (
        <div
          className={`${styles["loader-div"]} ${
            borderRadiusTheLoader ? "rounded-md" : ""
          }`}
        >
          <IphoneLoader />
        </div>
      ) : (
        ""
      )}
      <div className={styles["container"]}>
        <div>
          <Image
            src={imageUrl.current}
            alt="product image"
            width={100}
            height={100}
          />
        </div>
        <div>
          <p className="mb-1">{cartItem.product?.name}</p>
          {cartItem.variant == null ? (
            ""
          ) : (
            <span className="flex flex-col gap-2">
              {cartItem.variant.attributeValues.map((attributeValue) => {
                return (
                  <span
                    key={attributeValue.id}
                    className="flex w-fit text-sm gap-2 bg-gray-100 p-2 rounded-md"
                  >
                    <span>{attributeValue.attribute?.name}</span>
                    <span>{attributeValue.value}</span>
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
                  </span>
                );
              })}
            </span>
          )}
        </div>
        <div>
          <p className="flex flex-col gap-1 items-end">
            {cartItem.discounts?.map((discount) => {
              return (
                <span
                  className="line-through text-red-500 text-sm"
                  key={discount.promotionId}
                >
                  {discount.discountAmount} {dictionary.LYD}
                </span>
              );
            })}
            <span className="mb-2 font-[600] text-[#a1812e]">
              <span>{quantity}</span> <span className="font-bold">x</span>{" "}
              <span>{cartItem.finalPrice} </span>
              <span>{dictionary.LYD} </span>
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              className="text-red-500 transition-colors hover:text-red-700"
              onClick={() => deleteCartItem()}
            >
              <MdDelete />
            </button>
            <div className={styles["quantity-handler-div"]}>
              <button
                onClick={() => {
                  if (cartItem.quantity > 1) {
                    updateCartQuantity(cartItem.quantity - 1);
                  } else {
                    deleteCartItem();
                  }
                }}
              >
                -
              </button>
              {/* <span>{cartItem.quantity}</span> */}
              <Input
                type="number"
                className={styles["quantity-input"]}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <button onClick={() => updateCartQuantity(cartItem.quantity + 1)}>
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
