import React from "react";
import SingleCategoryContentContainer from "./components/SingleCategoryContentContainer";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const categoryId = +id;
  const key = Math.random();
  if (isNaN(categoryId)) {
    return <div>Invalid category id</div>;
  }
  return <SingleCategoryContentContainer categoryId={categoryId} key={key} />;
}
