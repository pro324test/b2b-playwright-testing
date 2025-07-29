import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import AttributesContentContainer from "./components/AttributesContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <AttributesContentContainer queryParams={queryParams} key={key} />;
}
