"use client";

import { OrderStatusValue } from "@/types/ourApiSepecifc/Order";
import React from "react";

type Props = {
  status: OrderStatusValue;
};

export default function OrderStatus({ status }: Props) {
  let statusBgColor = "bg-gray-500";
  switch (status) {
    case "pending":
      statusBgColor = "bg-yellow-500";
      break;
    case "confirmed":
      statusBgColor = "bg-blue-500";
      break;
    case "processing":
      statusBgColor = "bg-orange-500";
      break;
    case "shipped":
      statusBgColor = "bg-green-500";
      break;
    case "delivered":
      statusBgColor = "bg-purple-500";
      break;
    case "canceled":
      statusBgColor = "bg-red-500";
      break;
    default:
      break;
  }
  return (
    <p className={`${statusBgColor} text-white py-2 px-4 rounded-md`}>
      {status}
    </p>
  );
}
