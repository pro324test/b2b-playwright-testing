import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import CitiesContentContainer from "./components/CitiesContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <CitiesContentContainer queryParams={queryParams} key={key} />;
}
