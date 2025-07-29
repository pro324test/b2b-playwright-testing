"use client";

import { assetsConstants } from "@/constants/assetsConstants";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import { updateCart } from "@/redux/features/cart/cartSlice";
import { cartRequests } from "@/requests/ourApi/cartRequests";
import { Cart } from "@/types/ourApiSepecifc/Cart";
import { Product } from "@/types/ourApiSepecifc/Product";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { formatFileUrl } from "@/utils/formatFileUrl";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { AxiosResponse } from "axios";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import styles from "./styles/FavouriteProductBoxStyles.module.css";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import CartDrawer from "@/components/protected/cartDrawer/CartDrawer";
import { useRouter } from "nextjs-toploader/app";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";

type Props = {
  product: Product;
};

export default function FavouriteProductBox({ product }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const router = useRouter();
  const privateAxios = usePrivateAxios({});
  const dispatch = useAppDispatch();
  const imageSrc = product.images?.length
    ? formatFileUrl(product.images[0].path)
    : assetsConstants.defaultImage;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addProductToCart = useCallback(async (data: object) => {
    setIsAddingToCart(true);
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
      setIsAddingToCart(false);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <button
        key={product.id}
        className="w-full block border-t border-gray-200 pt-4 "
        onClick={() => {
          router.push(routes.singleProduct.href({ lang, id: product.id }));
          return;
        }}
      >
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Image
              src={imageSrc}
              alt="product image"
              width={200}
              height={200}
              className="w-[135px] h-[100px] object-cover rounded-md"
            />
            <div className=" text-start">
              <p className="text-lg font-bold">{product.name}</p>
              <p className="text-main-color font-bold">
                {product.basePrice} {dictionary.LYD}
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button
              className={styles["add-to-cart-button"]}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isAddingToCart) return;
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
              {isAddingToCart ? (
                <div className="min-w-[90px] flex justify-center items-center">
                  <IphoneLoader additionalClassNames="!w-[15px] !h-[15px]" />
                </div>
              ) : (
                <>
                  <span>{dictionary.addToCart}</span>
                  <Image
                    src={assetsConstants.cartIcon}
                    alt="cart"
                    width={25}
                    height={25}
                    className="w-[20px] h-[20px]"
                  />
                </>
              )}
            </button>
            <button>
              <Image
                src={assetsConstants.favouriteRedIcon}
                alt="Favourite"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
      </button>
      <CartDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        product={product}
      />
    </>
  );
}
