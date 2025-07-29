import NoDataFound from "@/components/globals/NoDataFound";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import React from "react";
import SingleProductContentContainer from "./components/SingleProductContentContainer";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (isNaN(+id)) {
    return <div>Invalid ID</div>;
  }
  try {
    const response = await productsRequests.findById(+id);
    const key = Math.random();
    return <SingleProductContentContainer product={response.data} key={key} />;
  } catch {
    return <NoDataFound />;
  }
}
