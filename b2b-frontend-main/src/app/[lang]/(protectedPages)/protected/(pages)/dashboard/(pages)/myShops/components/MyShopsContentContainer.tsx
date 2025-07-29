"use client";

import React from "react";
import HeadingTitle from "@/components/dashboard/HeadingTitle";
import ShopSingleTableRow from "@/components/dashboard/shops/ShopSingleTableRow";
import NoDataFound from "@/components/globals/NoDataFound";
import { useAppSelector } from "@/redux/config/hooks";
import RequestAShopButtonWithDialog from "./RequestAShopButtonWithDialog";

export default function MyShopsContentContainer() {
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  if (!authEntity?.vendor?.shops) {
    return <NoDataFound />;
  }
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle label="My Shops" />
        <RequestAShopButtonWithDialog />
      </div>

      <table className="custom-table">
        <thead>
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Name</th>
            <th className="text-center">Description</th>
            <th className="text-center">Active</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {authEntity?.vendor?.shops?.map((shop) => (
            <ShopSingleTableRow key={shop.id} shop={shop} isMyShop />
          ))}
        </tbody>
      </table>
    </>
  );
}
