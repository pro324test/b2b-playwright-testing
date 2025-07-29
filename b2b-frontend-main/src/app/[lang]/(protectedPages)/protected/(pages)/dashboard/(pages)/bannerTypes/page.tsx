import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import BannerTypesContent from "./components/BannerTypesContent";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <BannerTypesContent queryParams={queryParams} key={key} />;
}
