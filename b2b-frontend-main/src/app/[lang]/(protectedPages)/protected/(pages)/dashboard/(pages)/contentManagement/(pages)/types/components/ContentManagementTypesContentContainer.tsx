"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { useAppSelector } from "@/redux/config/hooks";
import { contentManagementTypesRequests } from "@/requests/ourApi/contentManagementTypesRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { ContentManagmentType } from "@/types/ourApiSepecifc/ContentManagementType";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import ContentManagementTypeSingleTableRow from "./ContentManagementTypeSingleTableRow";
import CreateContentManagementTypeButtonWithDialog from "./CreateContentManagementTypeButtonWithDialog";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function ContentManagementTypesContentContainer({
  queryParams,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ContentManagmentType[]>([]);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const response = await contentManagementTypesRequests.getAll({
          queryParams,
        });
        setData(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    getData();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <HeadingTitle label="Content Management " />
        <CreateContentManagementTypeButtonWithDialog />
      </div>
      {isLoading ? (
        <LoadingInDashboard />
      ) : data.length == 0 ? (
        <NoDataFound />
      ) : (
        <div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>id</th>
                <th>name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((contentManagementType) => (
                <ContentManagementTypeSingleTableRow
                  key={contentManagementType.id}
                  contentManagementType={contentManagementType}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
