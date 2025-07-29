import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import SingleShopCouponsContentContainer from "./components/SingleShopCouponsContentContainer";

type Props = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ params, searchParams }: Props) {
  const { id: shopId } = await params;
  const queryParams = await searchParams;
  if (isNaN(+shopId)) {
    return <div>Invalid ID</div>;
  }
  const key = Math.random();
  return (
    <SingleShopCouponsContentContainer
      shopId={+shopId}
      key={key}
      queryParams={queryParams}
    />
  );
}
