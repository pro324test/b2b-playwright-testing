"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import Pagination from "@/components/globals/Pagination";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { useAppSelector } from "@/redux/config/hooks";
import { categoriesRequests } from "@/requests/ourApi/categoriesRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Category } from "@/types/ourApiSepecifc/Category";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import CreateCategoryButtonWithDialog from "./CreateCategoryButtonWithDialog";
import CategorySingleTableRow from "./CategorySingleTableRow";

type Props = {
  queryParams: DefaultQueryParams;
  onlyRoot?: boolean;
};

export default function CategoriesContentContainer({
  queryParams,
  onlyRoot,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [response, setResponse] = useState<PaginatedResponse<Category> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = onlyRoot
          ? await categoriesRequests.getRootCategories({ queryParams })
          : await categoriesRequests.getAll({ queryParams });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <HeadingTitle label="Categories" />
        <CreateCategoryButtonWithDialog />
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
                <th>ID</th>
                <th>Name</th>
                <th>Parent Category</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((category) => (
                <CategorySingleTableRow key={category.id} category={category} />
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
