import React from "react";
import EditProductContentContainer from "./components/EditProductContentContainer";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import NoDataFound from "@/components/globals/NoDataFound";

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
    return <EditProductContentContainer product={response.data} />;
  } catch {
    return <NoDataFound />;
  }
}
