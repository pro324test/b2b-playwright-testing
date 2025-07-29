"use client";

import { Slider } from "@/types/ourApiSepecifc/Slider";
import { formatFileUrl } from "@/utils/formatFileUrl";
import Image from "next/image";
import React from "react";
import SingleSliderActionsDropdown from "./SingleSliderActionsDropdown";

type Props = {
  slider: Slider;
};

export default function SliderSingleTableRow({ slider }: Props) {
  return (
    <>
      <tr>
        <td>{slider.id}</td>
        <td>
          <div className="flex justify-center items-center">
            <Image
              src={formatFileUrl(slider.imageUrl)}
              alt="Slider"
              width={100}
              height={100}
              className="w-[50px] h-[50px]"
            />
          </div>
        </td>
        <td>{slider.link || ""}</td>
        <td>
          <SingleSliderActionsDropdown slider={slider} />
        </td>
      </tr>
    </>
  );
}
