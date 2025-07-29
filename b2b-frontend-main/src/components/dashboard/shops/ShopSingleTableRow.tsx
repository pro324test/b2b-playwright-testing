"use client";

import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { shopsRequests } from "@/requests/ourApi/shopsRequests";
import { Shop } from "@/types/ourApiSepecifc/Shop";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import SingleShopActionsDropdown from "./SingleShopActionsDropdown";
import { FaCircleInfo } from "react-icons/fa6";

type Props = {
  shop: Shop;
  isMyShop?: boolean;
};

export default function ShopSingleTableRow({ shop, isMyShop }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(shop.status == "enabled");

  const handleDisable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await shopsRequests.disable({
        privateAxios,
        shopId: shop.id,
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
      const response = await shopsRequests.enable({
        privateAxios,
        shopId: shop.id,
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

  let activityTogglerIsDisabled =
    (authEntity?.role != "superadmin" && authEntity?.role != "admin") ||
    isLoading;
  if (isMyShop && shop.status != "pending" && shop.status != "rejected") {
    activityTogglerIsDisabled = false;
  }

  const textToShowForDisablingReason =
    shop.status == "pending"
      ? "Shop Is In Pending State"
      : shop.status == "rejected"
      ? "Shop Request Is Rejected"
      : null;

  return (
    <>
      <LoadingWithOverlay isLoading={isLoading} />
      <tr>
        <td>{shop.id}</td>

        <td>{shop.name}</td>
        <td className="cutted-text max-w-[25vw]" title={shop.description}>
          {shop.description}
        </td>
        <td>
          <div className="flex justify-center items-center gap-4 relative">
            <span
              className="text-red-500 absolute left-0"
              title={textToShowForDisablingReason || ""}
            >
              <div className={textToShowForDisablingReason ? "" : "opacity-0"}>
                <FaCircleInfo />
              </div>
            </span>
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
          </div>
        </td>
        <td>
          <SingleShopActionsDropdown shop={shop} isMyShop={isMyShop} />
        </td>
      </tr>
    </>
  );
}
