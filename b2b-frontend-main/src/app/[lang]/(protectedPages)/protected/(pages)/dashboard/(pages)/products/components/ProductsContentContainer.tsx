"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Product } from "@/types/ourApiSepecifc/Product";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import Pagination from "@/components/globals/Pagination";
import ProductSingleTableRow from "@/components/dashboard/products/ProductSingleTableRow";
import SelectShopToCreateProductModal from "@/components/dashboard/products/modals/SelectShopToCreateProductModal";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function ProductsContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [
    isWantingToCreateProductModalOpen,
    setIsWantingToCreateProductModalOpen,
  ] = useState(false);
  const [response, setResponse] = useState<PaginatedResponse<Product> | null>(
    null
  );

  useEffect(() => {
    async function getData() {
      setIsLoading(true);
      try {
        const response = await productsRequests.getProductsOfCurrentVendor({
          privateAxios,
          queryParams,
        });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    }
    getData();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <SelectShopToCreateProductModal
        isOpen={isWantingToCreateProductModalOpen}
        setIsOpen={setIsWantingToCreateProductModalOpen}
      />
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle label="Products" />
        <button
          onClick={() => {
            setIsWantingToCreateProductModalOpen(true);
          }}
          className="py-2 px-6 bg-green-600 text-white transition-colors hover:bg-green-700"
        >
          Create Product
        </button>
      </div>

      {isLoading ? <LoadingInDashboard /> : ""}

      {response == null || response.data.length === 0 ? (
        <NoDataFound />
      ) : (
        <>
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((product) => (
                <ProductSingleTableRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>

          <div className="my-8">
            <Pagination
              paginatedResponse={response}
              currentParams={queryParams}
            />
          </div>
        </>
      )}
    </>
  );
}
