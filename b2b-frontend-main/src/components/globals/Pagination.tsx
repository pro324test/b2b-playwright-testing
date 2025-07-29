"use client";
import React from "react";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { usePathname, useRouter } from "next/navigation";
import styles from "./styles/PaginationStyles.module.css";
import { useAppSelector } from "@/redux/config/hooks";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";

type Props = {
  paginatedResponse: PaginatedResponse<any>;
  currentParams?: DefaultQueryParams;
};

export default function Pagination({
  paginatedResponse,
  currentParams,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = paginatedResponse.meta.currentPage;
  const lastPage = paginatedResponse.meta.totalPages;
  let pages = [1, 2, currentPage, lastPage - 1, lastPage];
  pages = pages.filter((page) => page >= 1 && page <= lastPage && page !== 0);
  pages = pages.sort((a, b) => a - b);
  pages = Array.from(new Set(pages));
  const navigateTo = (page: number) => {
    const queryParams: any = { ...currentParams, page };

    router.push(`${pathname}?${new URLSearchParams(queryParams)}`);
  };

  return (
    <div className={styles["pagination-container"]}>
      <div
        className={`${styles["pagination-buttons-container"]} orangish-to-brownish-bg`}
      >
        <button
          disabled={currentPage == 1}
          onClick={() => navigateTo(currentPage - 1)}
        >
          {dictionary.prev}
        </button>
        {pages.map((page) => {
          const isCurrentPage = currentPage == page;
          return (
            <button
              key={page}
              className={`${isCurrentPage ? styles["active"] : ""} ${
                styles["number"]
              }`}
              disabled={isCurrentPage}
              onClick={() => {
                if (!isCurrentPage) {
                  navigateTo(page);
                }
              }}
            >
              {page}
            </button>
          );
        })}
        <button
          disabled={currentPage == lastPage}
          onClick={() => navigateTo(currentPage + 1)}
        >
          {dictionary.next}
        </button>
      </div>
      <div className={styles["metadata-div"]}>
        <p className="font-bold">
          {dictionary.totalResults}:{" "}
          <span>{paginatedResponse.meta.totalItems}</span>
        </p>
      </div>
    </div>
  );
}
