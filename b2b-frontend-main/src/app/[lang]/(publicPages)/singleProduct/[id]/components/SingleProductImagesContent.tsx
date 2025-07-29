"use client";

import { Product } from "@/types/ourApiSepecifc/Product";
import React, { useState } from "react";
import { assetsConstants } from "@/constants/assetsConstants";
import { formatFileUrl } from "@/utils/formatFileUrl";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import styles from "./styles/SingleProductImagesContentStyles.module.css";

type Props = {
  product: Product;
};

export default function SingleProductImagesContent({ product }: Props) {
  const [activeImage, setActiveImage] = useState<string>(
    product.images?.length
      ? formatFileUrl(product.images[0].path)
      : assetsConstants.defaultImage
  );

  return (
    <div className="w-[50%]  flex flex-col">
      <Image
        src={activeImage}
        alt={product.name}
        width={1000}
        height={1000}
        className="w-[100%] max-h-[450px] object-cover rounded-lg"
      />
      <div>
        {product.images?.length ? (
          <Swiper
            slidesPerView={"auto"}
            spaceBetween={10}
            freeMode={true}
            modules={[FreeMode]}
            className={styles["swiper"]}
          >
            {[...product.images, ...product.images, ...product.images].map(
              (image, index) => (
                <SwiperSlide
                  className={styles["swiper-slide"]}
                  key={index}
                  onClick={() => setActiveImage(formatFileUrl(image.path))}
                >
                  <Image
                    src={formatFileUrl(image.path)}
                    alt={product.name}
                    width={1000}
                    height={1000}
                    className=""
                  />
                </SwiperSlide>
              )
            )}
          </Swiper>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
