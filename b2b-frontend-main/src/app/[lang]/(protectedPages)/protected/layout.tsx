"use client";

import React, { ReactNode } from "react";
import ProtectedPagesGuard from "./components/ProtectedPagesGuard";

type Props = {
  children: ReactNode;
};

export default function layout({ children }: Props) {
  return <ProtectedPagesGuard>{children}</ProtectedPagesGuard>;
}
