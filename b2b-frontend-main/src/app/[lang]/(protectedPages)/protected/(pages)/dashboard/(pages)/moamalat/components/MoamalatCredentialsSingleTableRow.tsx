"use client";

import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { moamalatRequests } from "@/requests/ourApi/moamalatRequests";
import { MoamalatCredentials } from "@/types/ourApiSepecifc/MoamalatCredentials";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import SingleMoamalatCredentialsActionsDropdown from "./SingleMoamalatCredentialsActionsDropdown";

type Props = {
  moamalatCredentials: MoamalatCredentials;
  isVendor?: boolean;
};

export default function MoamalatCredentialsSingleTableRow({
  moamalatCredentials,
  isVendor,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isActive, setIsActive] = useState(
    moamalatCredentials.isActive ?? false
  );
  const [isTogglingActivity, setIsTogglingActivity] = useState(false);
  const handleToggle = useCallback(async (wantToActivate: boolean) => {
    setIsTogglingActivity(true);
    try {
      const data = {
        isActive: wantToActivate,
      };
      const response = await moamalatRequests.toggleActiveVendorCredentials({
        privateAxios,
        data,
      });
      toastSuccessMessage({ dictionary, response });
      setIsActive(wantToActivate);
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsTogglingActivity(false);
    }
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <tr key={moamalatCredentials.id}>
        <td>{moamalatCredentials.merchantId}</td>
        <td>{moamalatCredentials.terminalId}</td>
        <td>{moamalatCredentials.secureKey}</td>
        {isVendor && (
          <td>
            <ActivityToggler
              isActive={isActive}
              disabled={isTogglingActivity}
              onToggle={() => {
                if (isTogglingActivity) return;
                handleToggle(!isActive);
              }}
            />
          </td>
        )}
        <td>
          <SingleMoamalatCredentialsActionsDropdown
            moamalatCredentials={moamalatCredentials}
          />
        </td>
      </tr>
    </>
  );
}
