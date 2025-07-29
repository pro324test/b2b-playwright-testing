import React from "react";
import CreateProductContentContainer from "./components/CreateProductContentContainer";

type Props = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (isNaN(+id)) {
    return <div>Invalid ID</div>;
  }
  return <CreateProductContentContainer shopId={+id} />;
}
