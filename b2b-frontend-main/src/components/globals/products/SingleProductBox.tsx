"use client";

import { assetsConstants } from "@/constants/assetsConstants";
import { Product } from "@/types/ourApiSepecifc/Product";
import { formatFileUrl } from "@/utils/formatFileUrl";
import Image from "next/image";
import React, { useCallback, useRef, useState } from "react";
import styles from "./styles/SingleProductBoxStyles.module.css";
import { cartRequests } from "@/requests/ourApi/cartRequests";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { updateCart } from "@/redux/features/cart/cartSlice";
import { AxiosResponse } from "axios";
import { Cart } from "@/types/ourApiSepecifc/Cart";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { FaPlus, FaRegHeart } from "react-icons/fa";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import CartDrawer from "@/components/protected/cartDrawer/CartDrawer";

type Props = {
  product: Product;
};

export default function SingleProductBox({ product }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const dispatch = useAppDispatch();
  const privateAxios = usePrivateAxios({});
  const imageUrl = useRef(
    product.images?.length
      ? formatFileUrl(product.images[0].path)
      : assetsConstants.defaultImage
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      <Link
        className={styles["container"]}
        href={routes.singleProduct.href({ lang, id: product.id })}
      >
        <p className={styles["discount-value"]}>50%-</p>
        <p className={styles["new-value"]}>{dictionary.new}</p>
        <Image
          src={imageUrl.current}
          alt="product image"
          width={200}
          height={200}
        />
        <div className={styles["product-info"]}>
          <p className={styles["product-name"]}>{product.name}</p>
          <p
            className={`text-gray-600 cutted-text ${styles["product-description"]}`}
          >
            {product.description}
          </p>
          <div className="flex gap-4 items-center justify-between">
            <p className="font-[600]">
              {product.basePrice} {dictionary.LYD}
            </p>
            <div className="flex gap-2 items-center">
              <button
                className={styles["add-to-favourite-button"]}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <FaRegHeart />
              </button>
              <button
                className={styles["add-to-cart-button"]}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isLoading) return;
                  if (product.variants?.length) {
                    setIsDrawerOpen(true);
                    return;
                  }

                  addProductToCart({
                    productId: product.id,
                    quantity: 1,
                  });
                }}
              >
                {isLoading ? (
                  <IphoneLoader
                    additionalClassNames="!w-[15px] !h-[15px]"
                    barsWhite
                  />
                ) : (
                  <FaPlus />
                )}
              </button>
            </div>
          </div>
        </div>
        <CartDrawer
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          product={product}
        />
      </Link>
    </>
  );
}
