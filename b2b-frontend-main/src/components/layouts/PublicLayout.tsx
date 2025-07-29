"use client";

import React from "react";
import PublicTopMenu from "./PublicTopMenu";
import PublicFooter from "./PublicFooter";

type Props = {
  children: React.ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <>
      <PublicTopMenu />
      <div className="min-h-[59vh]">{children}</div>
      <PublicFooter />
    </>
  );
}
