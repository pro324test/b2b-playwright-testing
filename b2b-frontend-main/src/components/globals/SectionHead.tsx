"use client";

import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import { useAppSelector } from "@/redux/config/hooks";
import Link from "next/link";
import React from "react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

type Props = {
  label: string;
  showMoreLink?: string;
};

export default function SectionHead({ label, showMoreLink }: Props) {
  const websiteDirection = useWebsiteDirection();
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  return (
    <div className="flex justify-between items-center">
      <h2
        className={`py-8 px-8 my-8 text-4xl font-bold ${
          websiteDirection == "ltr" ? "border-l-4" : "border-r-4"
        } border-main-color text-main-color`}
      >
        {label}
      </h2>
      {showMoreLink ? (
        <Link
          href={showMoreLink}
          className="flex items-center  gap-8 text-main-color font-bold text-lg hover:text-[#162f46] transition-all duration-300 hover:px-2"
        >
          <span className="text-2xl font-normal ml-2">
            {dictionary.seeMore}
          </span>
          {websiteDirection == "ltr" ? (
            <FaArrowRightLong />
          ) : (
            <FaArrowLeftLong />
          )}
        </Link>
      ) : (
        ""
      )}
    </div>
  );
}
