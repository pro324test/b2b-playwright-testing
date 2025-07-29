"use client";

import React from "react";
import { Provider } from "react-redux";
import { reduxStore } from "./store";

type Props = {
  children: React.ReactNode;
};

export default function ReduxProvider({ children }: Props) {
  return <Provider store={reduxStore}>{children}</Provider>;
}
