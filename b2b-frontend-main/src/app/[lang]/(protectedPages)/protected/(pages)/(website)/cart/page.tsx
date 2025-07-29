import React from "react";
import CartPageContentContainer from "./components/CartPageContentContainer";

export default function Page() {
  const key = Math.random();
  return <CartPageContentContainer key={key} />;
}
