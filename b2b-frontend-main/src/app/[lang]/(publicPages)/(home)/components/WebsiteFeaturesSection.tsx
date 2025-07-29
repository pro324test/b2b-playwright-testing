"use client";

import { assetsConstants } from "@/constants/assetsConstants";
import { useAppSelector } from "@/redux/config/hooks";
import Image from "next/image";
import React, { useRef } from "react";
import styles from "./styles/WebsiteFeaturesSectionStyles.module.css";

export default function WebsiteFeaturesSection() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const features = useRef([
    {
      label1: dictionary.homePageRefundLabel1,
      label2: dictionary.homePageRefundLabel2,
      icon: assetsConstants.refundIcon,
    },
    {
      label1: dictionary.homePageContactLabel1,
      label2: dictionary.homePageContactLabel2,
      icon: assetsConstants.contactIcon,
    },
    {
      label1: dictionary.homePageDeliveryLabel1,
      label2: dictionary.homePageDeliveryLabel2,
      icon: assetsConstants.deliveryIcon,
    },
  ]);
  return (
    <div className={styles["container"]}>
      <div className="flex gap-40 mt-8 justify-center padding-x">
        {features.current.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center text-center"
          >
            <Image
              src={feature.icon}
              alt={feature.label1}
              width={100}
              height={100}
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-lg font-semibold">{feature.label1}</h3>
            <p className="text-gray-600">{feature.label2}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
