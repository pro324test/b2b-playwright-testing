import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import VendorGroupsContentContainer from "./components/VendorGroupsContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <VendorGroupsContentContainer queryParams={queryParams} key={key} />;
}
