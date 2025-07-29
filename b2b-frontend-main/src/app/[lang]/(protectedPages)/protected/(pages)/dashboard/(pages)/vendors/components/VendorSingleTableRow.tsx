"use client";

import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import { Vendor } from "@/types/ourApiSepecifc/Vendor";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import SingleVendorActionsDropdown from "./SingleVendorActionsDropdown";

type Props = {
  vendor: Vendor;
};

export default function VendorSingleTableRow({ vendor }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const [isActive, setIsActive] = useState(!vendor.isDisabled);
  const [isLoading, setIsLoading] = useState(false);

  const activityTogglerIsDisabled =
    (authEntity?.role != "superadmin" && authEntity?.role != "admin") ||
    isLoading;

  const disableHandler = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await vendorsRequests.disable({
        privateAxios,
        vendorId: vendor.id,
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
  const enableHandler = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await vendorsRequests.enable({
        privateAxios,
        vendorId: vendor.id,
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
      <tr key={vendor.id}>
        <td>{vendor.id}</td>
        <td>{vendor.user?.email || ""}</td>
        <td>
          <ActivityToggler
            disabled={activityTogglerIsDisabled}
            isActive={isActive}
            onToggle={() => {
              if (activityTogglerIsDisabled) return;
              if (isActive) {
                disableHandler();
              } else {
                enableHandler();
              }
            }}
          />
        </td>
        <td>
          <SingleVendorActionsDropdown vendor={vendor} />
        </td>
      </tr>
    </>
  );
}
