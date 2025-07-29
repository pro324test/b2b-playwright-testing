import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import VendorRequestsContentContainer from "./components/VendorRequestsContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <VendorRequestsContentContainer queryParams={queryParams} key={key} />;
}
