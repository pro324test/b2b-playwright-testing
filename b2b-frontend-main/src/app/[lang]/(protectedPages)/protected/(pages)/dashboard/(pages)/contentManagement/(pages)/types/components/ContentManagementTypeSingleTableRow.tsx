"use client";

import { ContentManagmentType } from "@/types/ourApiSepecifc/ContentManagementType";
import React from "react";
import SingleContentManagementTypeActionsDropdown from "./SingleContentManagementTypeActionsDropdown";

type Props = {
  contentManagementType: ContentManagmentType;
};

export default function ContentManagementTypeSingleTableRow({
  contentManagementType,
}: Props) {
  return (
    <>
      <tr>
        <td>{contentManagementType.id}</td>
        <td>{contentManagementType.name}</td>
        <td>{contentManagementType.description}</td>
        <td>
          <SingleContentManagementTypeActionsDropdown
            contentManagementType={contentManagementType}
          />
        </td>
      </tr>
    </>
  );
}
