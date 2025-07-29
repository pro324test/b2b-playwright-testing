import AuthLayoutGuard from "@/components/layouts/AuthLayoutGuard";
import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
  // params: {
  //   lang: Lang;
  // };
};

export default async function layout({ children }: Props) {
  return <AuthLayoutGuard>{children}</AuthLayoutGuard>;
}
