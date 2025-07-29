"use client";

import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { couponsRequests } from "@/requests/ourApi/couponsRequests";
import { Coupon } from "@/types/ourApiSepecifc/Coupon";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import SingleCouponActionsDropdown from "./SingleCouponActionsDropdown";

type Props = {
  coupon: Coupon;
};

export default function CouponSingleTableRow({ coupon }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(coupon.status == "enabled");

  const handleEnable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await couponsRequests.enable({
        privateAxios,
        id: coupon.id,
      });
      setIsActive(true);
      toastSuccessMessage({ dictionary, response });
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const handleDisable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await couponsRequests.disable({
        privateAxios,
        id: coupon.id,
      });
      setIsActive(false);
      toastSuccessMessage({ dictionary, response });
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
        <td>{coupon.id}</td>
        <td>{coupon.code}</td>
        <td>{coupon.type}</td>
        <td>{coupon.value}</td>
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
          <SingleCouponActionsDropdown coupon={coupon} />
        </td>
      </tr>
    </>
  );
}
