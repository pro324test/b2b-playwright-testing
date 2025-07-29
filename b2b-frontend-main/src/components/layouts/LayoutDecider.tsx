"use client";

import DashboardLayout from "@/app/[lang]/(protectedPages)/protected/(pages)/dashboard/components/DashboardLayout";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { usePathname } from "next/navigation";
import React from "react";
import PublicLayout from "./PublicLayout";

type Props = {
  children: React.ReactNode;
};

export default function LayoutDecider({ children }: Props) {
  const lang = useLang();
  const pathname = usePathname();

  if (pathname.startsWith(routes.dashboard.startsWith({ lang }))) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  return <PublicLayout>{children}</PublicLayout>;
}
