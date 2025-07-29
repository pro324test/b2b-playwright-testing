"use client";

import React, { useEffect, useState } from "react";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { usersRequests } from "@/requests/ourApi/usersRequests";
import { User } from "@/types/ourApiSepecifc/User";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import NoDataFound from "@/components/globals/NoDataFound";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import HeadingTitle from "@/components/dashboard/HeadingTitle";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import Pagination from "@/components/globals/Pagination";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function UsersContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [response, setResponse] = useState<PaginatedResponse<User> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response: AxiosResponse<PaginatedResponse<User>> =
          await usersRequests.getUsers({ privateAxios, queryParams });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <div className="mb-4">
        <HeadingTitle label="Users" />
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
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                </tr>
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
