"use client";

import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import { VendorRequest } from "@/types/ourApiSepecifc/VendorRequest";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import VendorRequestSingleTableRow from "./VendorRequestSingleTableRow";
import Pagination from "@/components/globals/Pagination";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function VendorRequestsContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] =
    useState<PaginatedResponse<VendorRequest> | null>(null);

  useEffect(() => {
    const fetchVendorRequests = async () => {
      setIsLoading(true);
      try {
        const response: AxiosResponse<PaginatedResponse<VendorRequest>> =
          await vendorsRequests.getRequests({ privateAxios, queryParams });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendorRequests();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="mb-4">
        <HeadingTitle label="Vendor Requests" />
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
                <th>status</th>
                <th>created at</th>
                <th>user</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((vendorRequest) => (
                <VendorRequestSingleTableRow
                  key={vendorRequest.id}
                  vendorRequest={vendorRequest}
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
