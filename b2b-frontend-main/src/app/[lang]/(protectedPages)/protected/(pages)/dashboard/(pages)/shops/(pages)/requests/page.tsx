import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import ShopRequestsContentContainer from "./components/ShopRequestsContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <ShopRequestsContentContainer queryParams={queryParams} key={key} />;
}
