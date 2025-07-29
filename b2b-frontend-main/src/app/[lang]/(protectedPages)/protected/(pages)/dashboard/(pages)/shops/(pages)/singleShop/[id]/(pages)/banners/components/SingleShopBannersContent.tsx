"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import Pagination from "@/components/globals/Pagination";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { useAppSelector } from "@/redux/config/hooks";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Banner } from "@/types/ourApiSepecifc/Banner";
import { bannersRequests } from "@/types/ourApiSepecifc/bannerRequests";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useRef, useState } from "react";
import BannerSingleTableRow from "./BannerSingleTableRow";
import CreateBannerModal from "@/components/dashboard/banners/modals/CreateBannerModal";

type Props = {
  shopId: number;
  queryParams: DefaultQueryParams;
};

export default function SingleShopBannersContent({
  shopId,
  queryParams,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );

  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const [isCreatingBannerModalOpen, setIsCreatingBannerModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PaginatedResponse<Banner> | null>(
    null
  );
  const theShop = useRef(
    authEntity?.vendor?.shops?.find((shop) => shop.id === shopId)
  );
  const isMyShop = theShop.current != undefined && theShop.current != null;

  useEffect(() => {
    async function getData() {
      setIsLoading(true);
      try {
        const response = await bannersRequests.getBannersOfShop({
          shopId,
          queryParams,
        });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    }
    if (isMyShop) {
      getData();
    }
    // eslint-disable-next-line
  }, []);

  if (!isMyShop) {
    return <div>Not Authorized</div>;
  }
  return (
    <>
      <CreateBannerModal
        shop={theShop.current!}
        isOpen={isCreatingBannerModalOpen}
        setIsOpen={setIsCreatingBannerModalOpen}
      />
      <div className="mb-4 flex items-center justify-between">
        <HeadingTitle
          label="Banners Of "
          postLabel={
            <span className="text-main-color">
              &apos;{theShop.current?.name}&apos;
            </span>
          }
        />
        <button
          className={
            "py-2 px-6 bg-green-600 text-white flex gap-4 justify-center items-center"
          }
          onClick={() => setIsCreatingBannerModalOpen(true)}
        >
          Create Banner
        </button>
      </div>
      {isLoading ? (
        <LoadingInDashboard />
      ) : response == null || response.data.length == 0 ? (
        <NoDataFound />
      ) : (
        <div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Title</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((banner) => (
                <BannerSingleTableRow key={banner.id} banner={banner} />
              ))}
            </tbody>
          </table>
          <div className="my-8">
            <Pagination
              paginatedResponse={response}
              currentParams={queryParams}
            />
          </div>
        </div>
      )}
    </>
  );
}
