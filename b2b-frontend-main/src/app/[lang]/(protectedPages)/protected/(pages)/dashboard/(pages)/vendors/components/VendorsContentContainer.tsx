"use client";

import React, { useEffect, useState } from "react";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import { Vendor } from "@/types/ourApiSepecifc/Vendor";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import NoDataFound from "@/components/globals/NoDataFound";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import HeadingTitle from "@/components/dashboard/HeadingTitle";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import VendorSingleTableRow from "./VendorSingleTableRow";
import Pagination from "@/components/globals/Pagination";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function VendorsContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );

  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PaginatedResponse<Vendor> | null>(
    null
  );

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        const response: AxiosResponse<PaginatedResponse<Vendor>> =
          await vendorsRequests.getAll({ privateAxios });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendors();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="mb-4">
        <HeadingTitle label="Vendors" />
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
                <th>user</th>
                <th>Active</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((vendor) => (
                <VendorSingleTableRow key={vendor.id} vendor={vendor} />
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
