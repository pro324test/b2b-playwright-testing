import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import ProductsContentContainer from "./components/ProductsContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <ProductsContentContainer queryParams={queryParams} key={key} />;
}
