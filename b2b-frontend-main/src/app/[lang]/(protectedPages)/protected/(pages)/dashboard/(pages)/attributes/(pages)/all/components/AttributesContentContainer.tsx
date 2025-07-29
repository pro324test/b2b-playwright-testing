"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { useAppSelector } from "@/redux/config/hooks";
import { attributesRequests } from "@/requests/ourApi/attributesRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Attribute } from "@/types/ourApiSepecifc/Attribute";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import CreateAttributeButtonWithDialog from "./CreateAttributeButtonWithDialog";
import Pagination from "@/components/globals/Pagination";
import AttributeSingleTableRow from "../../../components/AttributeSingleTableRow";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function AttributesContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [response, setResponse] = useState<PaginatedResponse<Attribute> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await attributesRequests.getAll({ queryParams });
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
        <HeadingTitle label="Attributes" />
        <CreateAttributeButtonWithDialog />
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
                <th>active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((attribute) => (
                <AttributeSingleTableRow
                  key={attribute.id}
                  attribute={attribute}
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
