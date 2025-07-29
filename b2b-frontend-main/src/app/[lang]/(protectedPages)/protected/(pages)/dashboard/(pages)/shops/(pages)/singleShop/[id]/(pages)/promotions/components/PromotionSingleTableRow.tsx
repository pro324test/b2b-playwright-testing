"use client";

import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { promotionsRequests } from "@/requests/ourApi/promotionsRequests";
import { Promotion } from "@/types/ourApiSepecifc/Promotion";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import SinglePromotionActionsDropdown from "./SinglePromotionActionsDropdown";

type Props = {
  promotion: Promotion;
};

export default function PromotionSingleTableRow({ promotion }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isActive, setIsActive] = useState(promotion.status == "enabled");
  const [isLoading, setIsLoading] = useState(false);

  const handleDisable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await promotionsRequests.disable({
        privateAxios,
        promotionId: promotion.id,
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
      const response = await promotionsRequests.enable({
        privateAxios,
        promotionId: promotion.id,
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
      <tr>
        <td>{promotion.id}</td>
        <td>{promotion.name}</td>
        <td>
          <ActivityToggler
            isActive={isActive}
            disabled={isLoading}
            onToggle={() => {
              if (isLoading) return;
              if (isActive) {
                handleDisable();
              } else {
                handleEnable();
              }
            }}
          />
        </td>
        <td>
          <SinglePromotionActionsDropdown promotion={promotion} />
        </td>
      </tr>
    </>
  );
}
