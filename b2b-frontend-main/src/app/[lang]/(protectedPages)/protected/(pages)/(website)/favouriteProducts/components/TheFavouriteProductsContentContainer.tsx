"use client";

import NoDataFound from "@/components/globals/NoDataFound";
import WebsiteIsLoading from "@/components/loaders/WebsiteIsLoading";
import { useAppSelector } from "@/redux/config/hooks";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Product } from "@/types/ourApiSepecifc/Product";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import FavouriteProductBox from "./FavouriteProductBox";

export default function TheFavouriteProductsContentContainer() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isLoading, setIsLoading] = useState(false);
  const [productsResponse, setProductsResponse] =
    useState<PaginatedResponse<Product> | null>(null);

  useEffect(() => {
    async function getProducts() {
      try {
        setIsLoading(true);
        const response = await productsRequests.getAll({});
        setProductsResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    }

    getProducts();
    // eslint-disable-next-line
  }, []);

  if (isLoading) {
    return <WebsiteIsLoading />;
  }

  if (productsResponse == null || productsResponse.data.length == 0) {
    return <NoDataFound />;
  }

  return (
    <div className="padding-x mx-40">
      <div className="my-12 border border-gray-200 rounded-lg py-4 px-8">
        <h1 className="text-2xl font-bold mb-4">Favourite products</h1>
        <div className="flex flex-col gap-4">
          {productsResponse.data.map((product) => (
            <FavouriteProductBox key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
