import React from "react";
import MoamalatContentContainer from "./components/MoamalatContentContainer";

export default function Page() {
  const key = Math.random();
  return <MoamalatContentContainer key={key} />;
}
