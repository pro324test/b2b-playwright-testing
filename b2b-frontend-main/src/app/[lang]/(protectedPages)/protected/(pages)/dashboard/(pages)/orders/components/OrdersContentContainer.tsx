"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import Pagination from "@/components/globals/Pagination";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { ordersRequests } from "@/requests/ourApi/ordersrRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Order } from "@/types/ourApiSepecifc/Order";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";

type Props = {
  queryParams?: DefaultQueryParams;
};

export default function OrdersContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PaginatedResponse<Order> | null>(
    null
  );

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await ordersRequests.getAllByAdmin({ privateAxios });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle label="All Orders" />
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
                <th>Id</th>
                <th>Order Number</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.orderNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="my-8">
            <Pagination
              paginatedResponse={response}
              currentParams={queryParams}
            />
          </div>
        </div>
      )}
    </>
  );
}
