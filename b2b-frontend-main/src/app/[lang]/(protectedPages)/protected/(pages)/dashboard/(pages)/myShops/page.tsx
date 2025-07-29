"use client";

import React from "react";
import MyShopsContentContainer from "./components/MyShopsContentContainer";

export default function Page() {
  const key = Math.random();
  return <MyShopsContentContainer key={key} />;
}
