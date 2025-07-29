import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import OrdersContentContainer from "./components/OrdersContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <OrdersContentContainer key={key} queryParams={queryParams} />;
}
