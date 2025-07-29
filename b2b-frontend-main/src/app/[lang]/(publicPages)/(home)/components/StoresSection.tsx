"use client";

import SectionHead from "@/components/globals/SectionHead";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { useAppSelector } from "@/redux/config/hooks";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function StoresSection() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  return (
    <div className="padding-x mb-8">
      <SectionHead
        label={dictionary.stores}
        showMoreLink={routes.stores.href({ lang })}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2].map((item, index) => {
          return (
            <Link
              key={item + index}
              href={"#"}
              className="bg-gray-100 p-4 flex items-center justify-center"
            >
              <Image
                src={`/assets/images/stores/store-${item}.png`}
                alt="store"
                width={200}
                height={200}
                className="object-cover"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
