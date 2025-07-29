"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { moamalatRequests } from "@/requests/ourApi/moamalatRequests";
import { MoamalatCredentials } from "@/types/ourApiSepecifc/MoamalatCredentials";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import CreateMoamalatCredentialsButtonWithDialog from "./CreateMoamalatCredentialsButtonWithDialog";
import MoamalatCredentialsSingleTableRow from "./MoamalatCredentialsSingleTableRow";

export default function MoamalatContentContainer() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});

  const [isLoading, setIsLoading] = useState(false);
  const [moamalatCredentials, setMoamalatCredentials] =
    useState<MoamalatCredentials | null>(null);
  const isVendor = authEntity?.role == "vendor";
  const isAdmin =
    authEntity?.role == "admin" || authEntity?.role == "superadmin";

  useEffect(() => {
    const fetchVendorCredentials = async () => {
      setIsLoading(true);
      try {
        const response = await moamalatRequests.getCurrentVendorCredentials({
          privateAxios,
        });
        setMoamalatCredentials(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    const fetchAdminCredentials = async () => {
      setIsLoading(true);
      try {
        const response = await moamalatRequests.getDefaultSystemCredentials({
          privateAxios,
        });
        setMoamalatCredentials(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    if (isVendor) {
      fetchVendorCredentials();
    }
    if (isAdmin) {
      fetchAdminCredentials();
    }
    // eslint-disable-next-line
  }, []);

  if (!isVendor && !isAdmin) {
    return <h2>Not Authorized</h2>;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <HeadingTitle label="Moamalat" />
        {!isLoading && moamalatCredentials == null ? (
          <CreateMoamalatCredentialsButtonWithDialog />
        ) : null}
      </div>
      {isLoading ? (
        <LoadingInDashboard />
      ) : moamalatCredentials == null ? (
        <NoDataFound />
      ) : (
        <div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Merchant Id</th>
                <th>Terminal Id</th>
                <th>Secure Key</th>
                {isVendor ? <th>Active</th> : null}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <MoamalatCredentialsSingleTableRow
                moamalatCredentials={moamalatCredentials}
                isVendor={isVendor}
              />
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
