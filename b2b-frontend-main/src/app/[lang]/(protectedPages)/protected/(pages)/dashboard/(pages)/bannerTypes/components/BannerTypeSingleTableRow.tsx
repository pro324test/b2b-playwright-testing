"use client";

import { BannerType } from "@/types/ourApiSepecifc/BannerType";
import React from "react";
import SingleBannerTypeActionsDropdown from "./SingleBannerTypeActionsDropdown";

type Props = {
  bannerType: BannerType;
};

export default function BannerTypeSingleTableRow({ bannerType }: Props) {
  return (
    <>
      <tr>
        <td>{bannerType.id}</td>
        <td>{bannerType.name}</td>
        <td className="max-w-[25vw] cutted-text">{bannerType.description}</td>
        <td>{bannerType.width}</td>
        <td>{bannerType.height}</td>
        <td>
          <SingleBannerTypeActionsDropdown bannerType={bannerType} />
        </td>
      </tr>
    </>
  );
}
