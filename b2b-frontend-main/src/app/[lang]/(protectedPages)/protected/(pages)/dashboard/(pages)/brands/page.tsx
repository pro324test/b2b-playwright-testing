import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import BrandsContentContainer from "./components/BrandsContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <BrandsContentContainer queryParams={queryParams} key={key} />;
}
