import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import CouponsContentDesider from "./components/CouponsContentDesider";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <CouponsContentDesider queryParams={queryParams} key={key} />;
}
