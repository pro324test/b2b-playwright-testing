"use client";

import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { adminsRequests } from "@/requests/ourApi/adminsRequests";
import { Admin } from "@/types/ourApiSepecifc/Admin";
import { extractDateAndTime } from "@/utils/extractDateAndTime";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import SingleAdminActionsDropdown from "./SingleAdminActionsDropdown";

type Props = {
  admin: Admin;
};

export default function AdminSingleTableRow({ admin }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const [isActive, setIsActive] = useState(!admin.isDisabled);
  const [isLoading, setIsLoading] = useState(false);

  const activityTogglerIsDisabled =
    authEntity?.role != "superadmin" || isLoading;

  const handleDisable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminsRequests.disable({
        privateAxios,
        id: admin.id,
      });
      toastSuccessMessage({ dictionary, response });
      setIsActive(false);
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const handleEnable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminsRequests.enable({
        privateAxios,
        id: admin.id,
      });
      toastSuccessMessage({ dictionary, response });
      setIsActive(true);
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <LoadingWithOverlay isLoading={isLoading} />
      <tr key={admin.id}>
        <td>{admin.id}</td>
        <td>{admin.username}</td>
        <td>{admin.email}</td>
        <td>{admin.role}</td>
        <td>{extractDateAndTime(admin.createdAt).date}</td>
        <td>
          <ActivityToggler
            disabled={activityTogglerIsDisabled}
            onToggle={() => {
              if (activityTogglerIsDisabled) return;
              if (isActive) {
                handleDisable();
              } else {
                handleEnable();
              }
            }}
            isActive={isActive}
          />
        </td>
        {authEntity?.role == "superadmin" ? (
          <td>
            <SingleAdminActionsDropdown admin={admin} />
          </td>
        ) : (
          ""
        )}
      </tr>
    </>
  );
}
