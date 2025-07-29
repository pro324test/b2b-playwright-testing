"use client";

import React, { useEffect, useState } from "react";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { adminsRequests } from "@/requests/ourApi/adminsRequests";
import { Admin } from "@/types/ourApiSepecifc/Admin";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import NoDataFound from "@/components/globals/NoDataFound";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import HeadingTitle from "@/components/dashboard/HeadingTitle";
import CreateAdminButtonWithDialog from "./CreateAdminButtonWithDialog";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import AdminSingleTableRow from "./AdminSingleTableRow";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import Pagination from "@/components/globals/Pagination";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function AdminsContentContainer({ queryParams }: Props) {
  const { pageKey } = useAppSelector((state) => state.otherSlice);
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PaginatedResponse<Admin> | null>(
    null
  );

  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        const response: AxiosResponse<PaginatedResponse<Admin>> =
          await adminsRequests.getAll({ privateAxios, queryParams });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
    // eslint-disable-next-line
  }, [pageKey]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <HeadingTitle label="Admins" />
        <CreateAdminButtonWithDialog key={pageKey} />
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
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Active</th>
                {authEntity?.role == "superadmin" ? <th>Actions</th> : ""}
              </tr>
            </thead>
            <tbody>
              {response.data.map((admin) => (
                <AdminSingleTableRow key={admin.id} admin={admin} />
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
