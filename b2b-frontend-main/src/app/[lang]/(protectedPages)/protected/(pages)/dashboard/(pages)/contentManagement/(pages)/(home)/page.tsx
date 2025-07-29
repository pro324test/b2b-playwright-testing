import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import ContentManagementContentContainer from "./components/ContentManagementContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return (
    <ContentManagementContentContainer queryParams={queryParams} key={key} />
  );
}
