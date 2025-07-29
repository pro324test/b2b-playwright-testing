import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import ShopsContentContainer from "./components/ShopsContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <ShopsContentContainer queryParams={queryParams} key={key} />;
}
