import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import VendorsContentContainer from "./components/VendorsContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <VendorsContentContainer queryParams={queryParams} key={key} />;
}
