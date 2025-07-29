"use client";

import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import WebsiteIsLoading from "../loaders/WebsiteIsLoading";

type Props = {
  children: React.ReactNode;
};

export default function AuthLayoutGuard({ children }: Props) {
  const lang = useLang();
  const session = useSession();
  const searchParams = useSearchParams();
  const pageToRedirectTo = searchParams.get("redirect_to");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("theme", "light");
  }, []);

  if (session.status == "loading") {
    return <WebsiteIsLoading />;
  }
  if (session.status == "authenticated") {
    if (pageToRedirectTo) {
      redirect(pageToRedirectTo);
    } else {
      redirect(routes.home.href({ lang }));
    }
    // return;
  }
  return <>{children}</>;
}
