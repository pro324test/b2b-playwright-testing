import React from "react";
import SingleAttributeContentContainer from "./components/SingleAttributeContentContainer";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const attributeId = +id;
  const key = Math.random();
  if (isNaN(attributeId)) {
    return <div>Invalid attribute id</div>;
  }
  return (
    <SingleAttributeContentContainer attributeId={attributeId} key={key} />
  );
}
