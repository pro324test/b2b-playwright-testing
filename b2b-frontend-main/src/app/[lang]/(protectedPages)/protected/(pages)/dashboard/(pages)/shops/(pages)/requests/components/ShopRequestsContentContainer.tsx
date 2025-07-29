"use client";

import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import HeadingTitle from "@/components/dashboard/HeadingTitle";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { ShopRequest } from "@/types/ourApiSepecifc/ShopRequest";
import React, { useEffect, useState } from "react";
import NoDataFound from "@/components/globals/NoDataFound";
import { shopsRequests } from "@/requests/ourApi/shopsRequests";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import ShopRequestSingleTableRow from "./ShopRequestSingleTableRow";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function ShopRequestsContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] =
    useState<PaginatedResponse<ShopRequest> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await shopsRequests.getAllShopRequests({
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
        <HeadingTitle label="Shop Requests" />
      </div>
      {isLoading ? (
        <LoadingInDashboard />
      ) : response == null || response.data.length == 0 ? (
        <NoDataFound />
      ) : (
        <div className="my-4">
          <table className="custom-table">
            <thead>
              <tr>
                <th>id</th>
                <th>Status</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((shopRequest) => (
                <ShopRequestSingleTableRow
                  key={shopRequest.id}
                  shopRequest={shopRequest}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
