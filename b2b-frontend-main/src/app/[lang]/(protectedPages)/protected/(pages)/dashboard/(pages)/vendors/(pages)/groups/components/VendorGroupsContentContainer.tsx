"use client";

import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import { VendorGroup } from "@/types/ourApiSepecifc/VendorGroup";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import CreateVendorGroupButtonWithDialog from "./CreateVendorGroupButtonWithDialog";
import VendorGroupSingleTableRow from "./VendorGroupSingleTableRow";
import Pagination from "@/components/globals/Pagination";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function VendorGroupsContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] =
    useState<PaginatedResponse<VendorGroup> | null>(null);

  useEffect(() => {
    const fetchVendorGroups = async () => {
      setIsLoading(true);
      try {
        const response: AxiosResponse<PaginatedResponse<VendorGroup>> =
          await vendorsRequests.getGroups({ privateAxios, queryParams });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendorGroups();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle label="Vendor Groups" />
        <CreateVendorGroupButtonWithDialog />
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
                <th>name</th>
                <th>description</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((vendorGroup) => (
                <VendorGroupSingleTableRow
                  key={vendorGroup.id}
                  vendorGroup={vendorGroup}
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
