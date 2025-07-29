"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import Pagination from "@/components/globals/Pagination";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { useAppSelector } from "@/redux/config/hooks";
import { contentManagementRequests } from "@/requests/ourApi/contentManagementRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { ContentManagement } from "@/types/ourApiSepecifc/ContentManagement";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import ContentManagementSingleTableRow from "./ContentManagementSingleTableRow";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function ContentManagementContentContainer({
  queryParams,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] =
    useState<PaginatedResponse<ContentManagement> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response: AxiosResponse<PaginatedResponse<ContentManagement>> =
          await contentManagementRequests.getAll({ queryParams });
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
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <HeadingTitle label="Content Management" />
        <Link
          href={routes.dashboardCreateContentManagement.href({ lang })}
          className="py-2 px-6 bg-green-600 text-white flex gap-4 justify-center items-center"
        >
          Create Content Management
        </Link>
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
                <th>id</th>
                <th>title</th>
                <th>description</th>
                <th>images count</th>
                <th>is published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((contentManagement) => (
                <ContentManagementSingleTableRow
                  key={contentManagement.id}
                  contentManagement={contentManagement}
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
      )}
    </>
  );
}
