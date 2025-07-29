"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { BannerType } from "@/types/ourApiSepecifc/BannerType";
import { bannerTypesRequests } from "@/types/ourApiSepecifc/bannerTypesRequests";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import CreateBannerTypeButtonWithDialog from "./CreateBannerTypeButtonWithDialog";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import NoDataFound from "@/components/globals/NoDataFound";
import Pagination from "@/components/globals/Pagination";
import BannerTypeSingleTableRow from "./BannerTypeSingleTableRow";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function BannerTypesContent({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] =
    useState<PaginatedResponse<BannerType> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await bannerTypesRequests.getAll({
          privateAxios,
          queryParams,
        });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  if (authEntity?.role !== "admin" && authEntity?.role !== "superadmin") {
    return <div>Not Authrorized</div>;
  }
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <HeadingTitle label="Banner Types" />
        <CreateBannerTypeButtonWithDialog />
      </div>
      {isLoading ? (
        <LoadingInDashboard />
      ) : (
        <>
          {response == null || response.data.length == 0 ? (
            <NoDataFound />
          ) : (
            <>
              <div>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Width</th>
                      <th>Height</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.data.map((bannerType) => (
                      <BannerTypeSingleTableRow
                        key={bannerType.id}
                        bannerType={bannerType}
                      />
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
            </>
          )}
        </>
      )}
    </>
  );
}
