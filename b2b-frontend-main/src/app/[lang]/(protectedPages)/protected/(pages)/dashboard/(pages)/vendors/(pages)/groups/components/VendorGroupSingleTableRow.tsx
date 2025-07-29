"use client";

import { VendorGroup } from "@/types/ourApiSepecifc/VendorGroup";
import React from "react";
import SingleVendorGroupActionsDropdown from "./SingleVendorGroupActionsDropdown";

type Props = {
  vendorGroup: VendorGroup;
};

export default function VendorGroupSingleTableRow({ vendorGroup }: Props) {
  return (
    <>
      <tr key={vendorGroup.id}>
        <td>{vendorGroup.id}</td>
        <td>{vendorGroup.name}</td>
        <td
          className="cutted-text max-w-[25vw]"
          title={vendorGroup.description}
        >
          {vendorGroup.description}
        </td>
        <td>
          <SingleVendorGroupActionsDropdown vendorGroup={vendorGroup} />
        </td>
      </tr>
    </>
  );
}
