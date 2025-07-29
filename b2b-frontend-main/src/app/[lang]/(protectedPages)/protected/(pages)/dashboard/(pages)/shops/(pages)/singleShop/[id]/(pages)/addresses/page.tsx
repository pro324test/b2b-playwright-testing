import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import ShopAddressesContentContainer from "./components/ShopAddressesContentContainer";

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
    <ShopAddressesContentContainer
      shopId={+id}
      queryParams={queryParams}
      key={key}
    />
  );
}
