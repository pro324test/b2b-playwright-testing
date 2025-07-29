import React from "react";
import CurrentUserOrdersContentContainer from "./components/CurrentUserOrdersContentContainer";

export default function Page() {
  const key = Math.random();
  return <CurrentUserOrdersContentContainer key={key} />;
}
