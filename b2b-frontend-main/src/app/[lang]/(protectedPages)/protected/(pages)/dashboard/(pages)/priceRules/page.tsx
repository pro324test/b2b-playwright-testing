import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import PriceRulesContentContainer from "./components/PriceRulesContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <PriceRulesContentContainer queryParams={queryParams} key={key} />;
}
