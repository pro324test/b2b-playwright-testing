import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import ContentManagementTypesContentContainer from "./components/ContentManagementTypesContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return (
    <ContentManagementTypesContentContainer
      queryParams={queryParams}
      key={key}
    />
  );
}
