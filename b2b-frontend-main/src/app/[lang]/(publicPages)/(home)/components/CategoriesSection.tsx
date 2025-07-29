"use client";

import SectionHead from "@/components/globals/SectionHead";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { assetsConstants } from "@/constants/assetsConstants";
import { useAppSelector } from "@/redux/config/hooks";
import { categoriesRequests } from "@/requests/ourApi/categoriesRequests";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Category } from "@/types/ourApiSepecifc/Category";
import { AxiosResponse } from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function CategoriesSection() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getCategories() {
      try {
        const response: AxiosResponse<PaginatedResponse<Category>> =
          await categoriesRequests.getAll({});
        setCategories(response.data.data);
      } catch {
        // console.error('Error fetching categories:', error);
        // error
      } finally {
        setIsLoading(false);
      }
    }
    getCategories();
  }, []);
  return (
    <div className="padding-x">
      <SectionHead label={dictionary.categories} />
      {isLoading ? (
        <div className="flex justify-center items-center">
          <IphoneLoader />
        </div>
      ) : (
        ""
      )}
      <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-8 mt-4">
        {[...categories, ...categories, ...categories, ...categories].map(
          (category) => (
            <Link
              key={category.id}
              href={""}
              className="flex flex-col items-center justify-center gap-2"
            >
              <Image
                src={assetsConstants.categoryPlaceholderIcon}
                alt="category"
                width={125}
                height={125}
                className="rounded-full p-4 border-2 border-[black] bg-white"
              />
              <span className="text-md font-bold">{category.name}</span>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
