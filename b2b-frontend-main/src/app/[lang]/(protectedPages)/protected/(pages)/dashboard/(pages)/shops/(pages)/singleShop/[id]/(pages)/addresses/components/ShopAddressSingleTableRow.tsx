"use client";

import { ShopAddress } from "@/types/ourApiSepecifc/ShopAddress";
import React, { useCallback, useState } from "react";
import SingleShopAddressActionsDropdown from "./SingleShopAddressActionsDropdown";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useAppSelector } from "@/redux/config/hooks";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useRouter } from "next/navigation";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { shopAddressesRequests } from "@/requests/ourApi/shopAddressesRequest";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";

type Props = {
  shopAddress: ShopAddress;
};

export default function ShopAddressSingleTableRow({ shopAddress }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const router = useRouter();

  const makeAddressDefault = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await shopAddressesRequests.setDefaultAddress({
        addressId: shopAddress.id,
        privateAxios,
        shopId: shopAddress.shopId,
      });
      toastSuccessMessage({ dictionary, response });
      router.refresh();
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
        <td>{shopAddress.id}</td>
        <td>{shopAddress.street}</td>
        <td className="max-w-[25vw] cutted-text">{shopAddress.notes}</td>
        <td>
          <ActivityToggler
            isActive={shopAddress.isDefault}
            disabled={shopAddress.isDefault}
            onToggle={() => {
              if (shopAddress.isDefault) return;
              makeAddressDefault();
            }}
          />
        </td>
        <td>
          <SingleShopAddressActionsDropdown shopAddress={shopAddress} />
        </td>
      </tr>
    </>
  );
}
