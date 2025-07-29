"use client";

import { Banner } from "@/types/ourApiSepecifc/Banner";
import { extractDateAndTime } from "@/utils/extractDateAndTime";
import React, { useRef } from "react";
import SingleBannerActionsDropdown from "./SingleBannerActionsDropdown";

type Props = {
  banner: Banner;
};

export default function BannerSingleTableRow({ banner }: Props) {
  const startDate = useRef(
    banner.startDate ? extractDateAndTime(banner.startDate) : null
  );
  const endDate = useRef(
    banner.endDate ? extractDateAndTime(banner.endDate) : null
  );
  return (
    <>
      <tr>
        <td>{banner.id}</td>
        <td>{banner.title}</td>
        <td className="max-w-[25vw] cutted-text">{banner.description}</td>
        <td>
          {startDate.current
            ? `${startDate.current.date} ${startDate.current.time}`
            : ""}
        </td>
        <td>
          {endDate.current
            ? `${endDate.current.date} ${endDate.current.time}`
            : ""}
        </td>
        <td>
          <SingleBannerActionsDropdown banner={banner} />
        </td>
      </tr>
    </>
  );
}
