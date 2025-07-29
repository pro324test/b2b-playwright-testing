import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import CategoriesContentContainer from "../../components/CategoriesContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <CategoriesContentContainer queryParams={queryParams} key={key} />;
}
