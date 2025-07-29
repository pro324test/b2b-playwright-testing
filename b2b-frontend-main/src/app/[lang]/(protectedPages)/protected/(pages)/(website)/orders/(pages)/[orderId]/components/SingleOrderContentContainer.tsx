"use client";

import Divider from "@/components/globals/Divider";
import WebsiteIsLoading from "@/components/loaders/WebsiteIsLoading";
import OrderStatus from "@/components/protected/order/OrderStatus";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { ordersRequests } from "@/requests/ourApi/ordersrRequests";
import { Order } from "@/types/ourApiSepecifc/Order";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { AxiosResponse } from "axios";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import SingleCartItemInOrder from "./SingleCartItemInOrder";

type Props = {
  orderId: number;
};

export default function SingleOrderContentContainer({ orderId }: Props) {
  const privateAxios = usePrivateAxios({});
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function getOrder() {
      setIsLoading(true);
      try {
        const response: AxiosResponse<Order> = await ordersRequests.getById({
          privateAxios,
          orderId,
        });
        setOrder(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    }
    getOrder();
    // eslint-disable-next-line
  }, []);

  if (isLoading) {
    return <WebsiteIsLoading />;
  }

  if (order == null) {
    return <div>Order not found</div>;
  }
  return (
    <>
      <div className="my-8 p-4 padding-x bg-white rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">
              Order Number: {order.orderNumber}
            </h2>
            <p className="font-bold">Total Price: {order.totalAmount} LYD</p>

            {order.shop ? (
              <>
                <div>
                  <h4>Shop: {order.shop.name}</h4>
                </div>
              </>
            ) : (
              ""
            )}
            <p className="text-gray-500">
              {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm:ss")}
            </p>
          </div>
          <OrderStatus status={order.status} />
        </div>
        <Divider classNames="my-4" />

        {/* payments */}
        <h4 className="font-bold">Payments:</h4>
        {order.payments.map((payment) => {
          return (
            <div key={payment.id}>
              <p className="flex justify-between">
                <span>Method:</span> <span>{payment.paymentMethod}</span>
              </p>
              <p className="flex justify-between">
                <span>Amount:</span> <span>{payment.amount} LYD</span>
              </p>
              <p className="flex justify-between">
                <span>Status:</span> <span>{payment.status}</span>
              </p>
              <p className="flex justify-between">
                <span>Date: </span>
                <span>
                  {format(new Date(payment.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </span>
              </p>
              <Divider classNames="my-4" />
            </div>
          );
        })}
        {/* payments */}
        <div>
          <p className="">Items: ({order.items.length})</p>
          <p className="mb-4">Items Quantity: ({order.totalItemQuantity})</p>
          {order.items.map((item, index) => {
            return (
              <SingleCartItemInOrder
                key={item.id}
                item={item}
                isLastItem={index == order.items.length - 1}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
