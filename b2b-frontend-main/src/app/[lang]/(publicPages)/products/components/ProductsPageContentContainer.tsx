"use client";

import NoDataFound from "@/components/globals/NoDataFound";
import Pagination from "@/components/globals/Pagination";
import SingleProductBox from "@/components/globals/products/SingleProductBox";
import SectionHead from "@/components/globals/SectionHead";
import WebsiteIsLoading from "@/components/loaders/WebsiteIsLoading";
import { useAppSelector } from "@/redux/config/hooks";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Product } from "@/types/ourApiSepecifc/Product";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function ProductsPageContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isLoading, setIsLoading] = useState(true);
  const [productsResponse, setProductsResponse] =
    useState<PaginatedResponse<Product> | null>(null);

  useEffect(() => {
    async function getProducts() {
      try {
        setIsLoading(true);
        const response = await productsRequests.getAll({ queryParams });
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
  return (
    <div className="padding-x mb-8">
      <SectionHead label={dictionary.products} />
      {productsResponse == null || productsResponse.data.length === 0 ? (
        <NoDataFound />
      ) : (
        <div>
          <div className="products-grid-container">
            {productsResponse.data.map((product) => (
              <SingleProductBox key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            paginatedResponse={productsResponse}
            currentParams={queryParams}
          />
        </div>
      )}
    </div>
  );
}
