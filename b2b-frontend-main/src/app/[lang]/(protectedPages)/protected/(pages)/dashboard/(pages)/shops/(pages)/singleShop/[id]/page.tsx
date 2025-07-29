import { Lang } from "@/types/global/Lang";
import React from "react";
import SingleShopContentContainer from "./components/SingleShopContentContainer";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";

type Props = {
  params: Promise<{
    lang: Lang;
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
    <SingleShopContentContainer
      key={key}
      shopId={+id}
      queryParams={queryParams}
    />
  );
}
