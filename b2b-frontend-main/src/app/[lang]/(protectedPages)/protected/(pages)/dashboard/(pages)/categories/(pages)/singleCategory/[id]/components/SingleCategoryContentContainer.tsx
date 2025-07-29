"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { useAppSelector } from "@/redux/config/hooks";
import { categoriesRequests } from "@/requests/ourApi/categoriesRequests";
import { Category } from "@/types/ourApiSepecifc/Category";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import CreateCategoryButtonWithDialog from "../../../../components/CreateCategoryButtonWithDialog";
import CategorySingleTableRow from "../../../../components/CategorySingleTableRow";

type Props = {
  categoryId: number;
};

export default function SingleCategoryContentContainer({ categoryId }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await categoriesRequests.findByIdWithChildren(
          categoryId
        );
        setCategory(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);
  if (isLoading) {
    return <LoadingInDashboard />;
  }
  if (category == null) {
    return <NoDataFound />;
  }
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <HeadingTitle label={`${category?.name || ""}`} />
        <CreateCategoryButtonWithDialog categoryId={categoryId} />
      </div>

      <div>
        <table className="custom-table my-8">
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
            <CategorySingleTableRow key={category.id} category={category} />
          </tbody>
        </table>
        {category.children == null ||
        category.children == undefined ||
        category.children.length == 0 ? (
          ""
        ) : (
          <div className="my-8">
            <h4 className="mb-2 text-2xl font-bold">Sub Categories</h4>
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
                {category.children?.map((category) => (
                  <CategorySingleTableRow
                    key={category.id}
                    category={category}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
