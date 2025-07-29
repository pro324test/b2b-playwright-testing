"use client";

import SectionHead from "@/components/globals/SectionHead";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { assetsConstants } from "@/constants/assetsConstants";
import { useAppSelector } from "@/redux/config/hooks";
import { brandsRequest } from "@/requests/ourApi/brandsRequests";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Brand } from "@/types/ourApiSepecifc/Brand";
import { AxiosResponse } from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function BrandsSection() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getBrands() {
      try {
        const response: AxiosResponse<PaginatedResponse<Brand>> =
          await brandsRequest.getAll({});
        setBrands(response.data.data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getBrands();
  }, []);
  return (
    <div className="padding-x">
      <SectionHead label={dictionary.brands} />
      {isLoading ? (
        <div className="flex justify-center items-center">
          <IphoneLoader />
        </div>
      ) : (
        ""
      )}
      <div className="mt-8 grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-8">
        {[...brands, ...brands].map((brand) => (
          <div
            key={brand.id + Math.random()}
            className="flex flex-col items-center justify-center gap-2"
          >
            <Image
              src={assetsConstants.brandPlaceholderIcon}
              alt={brand.name}
              width={150}
              height={150}
              className="rounded-lg p-8 border-2 border-[#ccc] bg-white w-full object-cover"
            />
            {/* <span className="text-2xl font-bold">{brand.name}</span> */}
          </div>
        ))}
      </div>
    </div>
  );
}
