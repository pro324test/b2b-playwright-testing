import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import SlidersContentContainer from "./components/SlidersContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <SlidersContentContainer key={key} queryParams={queryParams} />;
}
