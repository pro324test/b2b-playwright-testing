import React from "react";
import PromotionsContentContainer from "./components/PromotionsContentContainer";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";

type Props = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const queryParams = await searchParams;
  if (isNaN(+id)) {
    return <div>Invalid ID</div>;
  }
  const key = Math.random();
  return (
    <PromotionsContentContainer
      key={key}
      shopId={+id}
      queryParams={queryParams}
    />
  );
}
