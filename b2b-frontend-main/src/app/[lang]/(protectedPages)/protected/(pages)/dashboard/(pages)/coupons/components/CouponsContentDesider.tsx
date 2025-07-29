"use client";

import { useAppSelector } from "@/redux/config/hooks";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import React from "react";
import CouponsAdminContentContainer from "./adminsContent/CouponsAdminContentContainer";
import CouponsVendorContentContainer from "./vendorsContent/CouponsVendorContentContainer";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function CouponsContentDesider({ queryParams }: Props) {
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);

  if (authEntity?.role == "admin" || authEntity?.role == "superadmin") {
    return <CouponsAdminContentContainer queryParams={queryParams} />;
  }
  if (authEntity?.role == "vendor") {
    return <CouponsVendorContentContainer queryParams={queryParams} />;
  }
  return (
    <div>
      <p>Not Authorized</p>
    </div>
  );
}
