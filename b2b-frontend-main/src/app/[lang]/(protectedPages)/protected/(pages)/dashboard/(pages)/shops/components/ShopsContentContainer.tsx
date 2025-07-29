"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { shopsRequests } from "@/requests/ourApi/shopsRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Shop } from "@/types/ourApiSepecifc/Shop";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import ShopSingleTableRow from "../../../../../../../../../components/dashboard/shops/ShopSingleTableRow";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function ShopsContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState<PaginatedResponse<Shop> | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await shopsRequests.getAll({
          privateAxios,
          queryParams,
        });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="mb-4">
        <HeadingTitle label="Shops" />
      </div>
      {isLoading ? (
        <LoadingInDashboard />
      ) : response == null || response.data.length == 0 ? (
        <NoDataFound />
      ) : (
        <div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>id</th>
                <th>name</th>
                <th>description</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((shop) => (
                <ShopSingleTableRow key={shop.id} shop={shop} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
