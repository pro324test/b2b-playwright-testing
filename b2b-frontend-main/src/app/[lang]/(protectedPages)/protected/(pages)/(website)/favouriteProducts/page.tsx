import React from "react";
import TheFavouriteProductsContentContainer from "./components/TheFavouriteProductsContentContainer";

export default function Page() {
  const key = Math.random();

  return <TheFavouriteProductsContentContainer key={key} />;
}
