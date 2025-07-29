"use client";

import NoDataFound from "@/components/globals/NoDataFound";
import Pagination from "@/components/globals/Pagination";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import OrderStatus from "@/components/protected/order/OrderStatus";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { ordersRequests } from "@/requests/ourApi/ordersrRequests";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Order } from "@/types/ourApiSepecifc/Order";
import { extractDateAndTime } from "@/utils/extractDateAndTime";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { AxiosResponse } from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function CurrentUserOrdersContentContainer() {
  const lang = useLang();
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [response, setResponse] = useState<PaginatedResponse<Order> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getOrders() {
      setIsLoading(true);
      try {
        const response: AxiosResponse<PaginatedResponse<Order>> =
          await ordersRequests.getCurrentUserOrders({ privateAxios });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    }
    getOrders();

    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="py-8 padding-x">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Orders</h2>
        </div>
        {isLoading ? (
          <LoadingInDashboard />
        ) : response == null || response?.data.length == 0 ? (
          <NoDataFound />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {response.data.map((order) => {
                const dateAndTime = extractDateAndTime(order.createdAt);
                return (
                  <Link
                    className="block border p-3 rounded-lg mb-3 bg-white hover:scale-[1.01] transition-all"
                    key={order.id}
                    href={routes.singleOrder.href({ lang, orderId: order.id })}
                  >
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-bold">{order.id}</h2>
                      <OrderStatus status={order.status} />
                    </div>
                    <p>
                      {order.totalAmount} {dictionary.LYD}
                    </p>
                    <p>
                      {dictionary.itemsCount}: {order.items.length}
                    </p>
                    <p>{`${dateAndTime.date} ${dateAndTime.time}`}</p>
                  </Link>
                );
              })}
            </div>
            <div className="mt-8">
              <Pagination paginatedResponse={response} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
