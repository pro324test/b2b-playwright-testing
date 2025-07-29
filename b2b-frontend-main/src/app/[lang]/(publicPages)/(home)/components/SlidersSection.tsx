"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { SwiperOptions } from "swiper/types";
import Image from "next/image";
import styles from "./styles/SlidersSectionStyles.module.css";
import { slidersRequests } from "@/requests/ourApi/slidersRequests";
import { Slider } from "@/types/ourApiSepecifc/Slider";
import { assetsConstants } from "@/constants/assetsConstants";

const images = [
  assetsConstants.bannerPlaceholder,
  assetsConstants.bannerPlaceholder,
  assetsConstants.bannerPlaceholder,
  assetsConstants.bannerPlaceholder,
];

export default function SlidersSection() {
  const swiperOptions: SwiperOptions = {
    pagination: {
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + "</span>";
      },
    },
  };
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSliders = async () => {
      setIsLoading(true);
      try {
        const response = await slidersRequests.getAll({});
        setSliders(response.data);
      } catch {
        // extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSliders();
  }, []);

  if (sliders.length == 0 || isLoading) return <></>;

  return (
    <div className="my-12 padding-x">
      <Swiper
        pagination={swiperOptions.pagination}
        modules={[Pagination]}
        className={styles["swiper"]}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <Image
              // src={formatFileUrl(image.imageUrl)}
              src={image}
              alt="The Banner"
              className="w-full h-[430px]  rounded-lg"
              width={1000}
              height={300}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
