"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Product } from "@/types/ourApiSepecifc/Product";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import ProductSingleTableRow from "../../../../../../../../../../../../components/dashboard/products/ProductSingleTableRow";

type Props = {
  shopId: number;
  queryParams: DefaultQueryParams;
};

export default function SingleShopContentContainer({
  shopId,
  queryParams,
}: Props) {
  const lang = useLang();
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );

  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const theShop = useRef(
    authEntity?.vendor?.shops?.find((shop) => shop.id === shopId)
  );
  const privateAxios = usePrivateAxios({});
  const [response, setResponse] = useState<PaginatedResponse<Product> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    () => {
      async function getData() {
        setIsLoading(true);
        try {
          const response = await productsRequests.getProductsByShopId({
            privateAxios,
            shopId,
            queryParams,
          });
          setResponse(response.data);
        } catch (error) {
          extractErrorAndToastIt({ error, dictionary });
        } finally {
          setIsLoading(false);
        }
      }
      if (theShop.current) {
        getData();
      }
    },
    // eslint-disable-next-line
    []
  );

  if (!theShop.current) {
    return <div>You Are Not Authorized to reach this page</div>;
  }

  if (isLoading) return <LoadingInDashboard />;
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle
          label={`Products of `}
          postLabel={
            <span className="text-main-color">{theShop.current.name}</span>
          }
        />
        <Link
          href={routes.dashboardCreateProductForShop.href({ lang, id: shopId })}
          className="py-2 px-6 bg-green-600 text-white transition-colors hover:bg-green-700"
        >
          Create Product
        </Link>
      </div>
      {response == null || response.data.length == 0 ? (
        <NoDataFound />
      ) : (
        <div>
          {" "}
          <table className="custom-table">
            <thead>
              <tr>
                <th>Id</th>
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
        </div>
      )}
    </>
  );
}
