"use client";

import SectionHead from "@/components/globals/SectionHead";
import { assetsConstants } from "@/constants/assetsConstants";
import { useAppSelector } from "@/redux/config/hooks";
import Image from "next/image";
import React, { useRef } from "react";

const formatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
});

export default function StatsSection() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const stats = useRef([
    {
      label: dictionary.storesTotalCount,
      value: 5000,
      icon: assetsConstants.storesCountIcon,
    },
    {
      label: dictionary.activeUsersOnOurWebsite,
      value: 55000,
      icon: assetsConstants.categoriesCountIcon,
    },
    {
      label: dictionary.productsTotalCount,
      value: 200000000,
      icon: assetsConstants.storesCountIcon,
    },
    {
      label: dictionary.categoriesForProducts,
      value: 7100,
      icon: assetsConstants.categoriesCountIcon,
    },
  ]);
  return (
    <div className="padding-x">
      <SectionHead label={dictionary.stats} />
      <div className="mt-8 flex justify-between items-center gap-8">
        {stats.current.map((stat) => (
          <button
            key={stat.label}
            className="w-full flex flex-col items-center justify-center gap-4 border-2 border-black py-8  rounded-lg transition-colors duration-300 hover:bg-[#3a3a3c] hover:text-white hover:border-white"
          >
            <Image
              src={stat.icon}
              alt={stat.label}
              width={100}
              height={100}
              className="w-[50px] h-[50px]"
            />
            <p className="text-2xl font-bold">{formatter.format(stat.value)}</p>
            <p className="text-xl">{stat.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
