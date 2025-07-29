"use client";

import { Product } from "@/types/ourApiSepecifc/Product";
import React, { useCallback, useState } from "react";
import SingleProductVariantsContent from "./SingleProductVariantsContent";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import { ProductVariant } from "@/types/ourApiSepecifc/ProductVariant";
import Image from "next/image";
import { assetsConstants } from "@/constants/assetsConstants";
import styles from "./styles/SingleProductActionsContainerStyles.module.css";
import { Input } from "@/components/ui/input";

import { FaMinus, FaPlus } from "react-icons/fa";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { AxiosResponse } from "axios";
import { Cart } from "@/types/ourApiSepecifc/Cart";
import { cartRequests } from "@/requests/ourApi/cartRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { updateCart } from "@/redux/features/cart/cartSlice";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import toast from "react-hot-toast";
import { toastErrorStylesObject } from "@/constants/toastStylesObjectConstants";

type Props = {
  product: Product;
};

export default function SingleProductActionsContainer({ product }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const dispatch = useAppDispatch();
  const privateAxios = usePrivateAxios({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  const addProductToCart = useCallback(async (data: object) => {
    setIsAddingToCart(true);
    try {
      const response: AxiosResponse<Cart> = await cartRequests.addItemToCart({
        privateAxios,
        data,
      });
      toastSuccessMessage({ dictionary, response });
      dispatch(updateCart(response.data));
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsAddingToCart(false);
    }
    // eslint-disable-next-line
  }, []);

  const price = selectedVariant?.price
    ? selectedVariant.price * quantity
    : Number(product.basePrice) * quantity;
  return (
    <>
      <div>
        {product.variants ? (
          <SingleProductVariantsContent
            productBasePrice={product.basePrice}
            variants={product.variants}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
          />
        ) : (
          ""
        )}
      </div>
      <div className="order-6 flex  gap-4">
        <button
          className={styles["add-to-cart-button"]}
          disabled={isAddingToCart}
          onClick={() => {
            if (isAddingToCart) return;
            if (product.variants?.length && !selectedVariant) {
              toast("please select a variant", {
                style: toastErrorStylesObject,
              });
              return;
            }
            const data: {
              productId: number;
              quantity: number;
              variantId?: number;
            } = {
              productId: product.id,
              quantity,
            };
            if (selectedVariant) {
              data.variantId = selectedVariant.id;
            }
            addProductToCart(data);
          }}
        >
          {isAddingToCart ? (
            <IphoneLoader />
          ) : (
            <>
              {" "}
              <Image
                src={assetsConstants.addToCartIcon}
                alt="cart"
                width={100}
                height={100}
                className="w-[24px] h-[24px]"
              />{" "}
              <span>{dictionary.addToCart}</span>
            </>
          )}
        </button>
        <div className={styles["quantity-container"]}>
          <button
            onClick={() => {
              setQuantity((prev) => prev + 1);
            }}
          >
            <FaPlus />
          </button>
          <Input
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <button
            onClick={() => {
              if (quantity < 2) {
                setQuantity(1);
                return;
              }
              setQuantity((prev) => prev - 1);
            }}
          >
            <FaMinus />
          </button>
        </div>
        <p className="mx-8 self-center">{dictionary.theTotal}</p>
        <p className={styles["price-value"]}>
          {price} {dictionary.LYD}
        </p>
      </div>
    </>
  );
}
