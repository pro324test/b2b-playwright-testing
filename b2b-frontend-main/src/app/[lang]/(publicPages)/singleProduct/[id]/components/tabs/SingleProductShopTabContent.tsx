"use client";

import { Product } from "@/types/ourApiSepecifc/Product";
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useAppSelector } from "@/redux/config/hooks";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { formatFileUrl } from "@/utils/formatFileUrl";
import styles from "./styles/SingleProductShopTabContentStyles.module.css";
import { FaStar } from "react-icons/fa";

type Props = {
  tabValue: string;
  product: Product;
};

export default function SingleProductShopTabContent({
  tabValue,
  product,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  return (
    <>
      <TabsContent value={tabValue}>
        <p>
          {dictionary.shop}: {product.shop?.name}
        </p>
        <p className="my-1">{dictionary.productsCount}: 18</p>
        <p className={styles["rating-container"]}>
          <span className="flex items-center gap-1">
            <span>{dictionary.rating}:</span>
            <FaStar />
          </span>
          <span> 4.6/5</span>
        </p>

        <p className="text-2xl font-bold my-4">
          {dictionary.moreFromThisShop}:
        </p>

        {product.images?.length ? (
          <Swiper
            slidesPerView={"auto"}
            spaceBetween={10}
            freeMode={true}
            modules={[FreeMode]}
            className={styles["swiper"]}
          >
            {[
              ...product.images,
              ...product.images,
              ...product.images,
              ...product.images,
              ...product.images,
            ].map((image, index) => (
              <SwiperSlide className={styles["swiper-slide"]} key={index}>
                <Image
                  src={formatFileUrl(image.path)}
                  alt={product.name}
                  width={1000}
                  height={1000}
                  className="w-full h-full"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          ""
        )}
      </TabsContent>
    </>
  );
}
