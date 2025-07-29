"use client";

import { useAppSelector } from "@/redux/config/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { BsDatabaseFillX } from "react-icons/bs";

type Props = {
  containerClassNames?: string;
  additionalTextAfterSorryWeDidNotFindAnyPrefix?: string;
  showPreviousPageLink?: boolean;
};

export default function NoDataFound({
  containerClassNames,
  additionalTextAfterSorryWeDidNotFindAnyPrefix,
  showPreviousPageLink,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const router = useRouter();
  return (
    <>
      <div
        className={`min-h-[80vh] flex flex-col gap-8 justify-center items-center ${
          containerClassNames || ""
        }`}
      >
        <div className="text-7xl">
          <BsDatabaseFillX />
        </div>
        <p className="text-4xl">
          {additionalTextAfterSorryWeDidNotFindAnyPrefix ? (
            <span>
              {`${dictionary.sorryWeDidNotFindAny} `}
              <span className="text-main-color">
                &apos;{additionalTextAfterSorryWeDidNotFindAnyPrefix}&apos;
              </span>
            </span>
          ) : (
            dictionary.sorryNoResultsFound
          )}
        </p>
        {showPreviousPageLink == false ? (
          <></>
        ) : (
          <Link
            className="main-link capitalize text-2xl"
            href={""}
            onClick={() => router.back()}
          >
            {dictionary.previousPage}
          </Link>
        )}
      </div>
    </>
  );
}
