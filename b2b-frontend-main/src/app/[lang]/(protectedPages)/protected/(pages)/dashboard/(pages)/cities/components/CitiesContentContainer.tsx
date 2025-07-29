"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { useAppSelector } from "@/redux/config/hooks";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import Pagination from "@/components/globals/Pagination";
import { City } from "@/types/ourApiSepecifc/City";
import { citiesRequests } from "@/requests/ourApi/citiesRequests";
import CreateCityButtonWithDialog from "./CreateCityButtonWithDialog";
import CitySingleTableRow from "./CitySingleTableRow";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function CitiesContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [response, setResponse] = useState<PaginatedResponse<City> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await citiesRequests.getAll({ queryParams });
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
        <HeadingTitle label="Cities" />
        <CreateCityButtonWithDialog />
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
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((city) => (
                <CitySingleTableRow key={city.id} city={city} />
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
