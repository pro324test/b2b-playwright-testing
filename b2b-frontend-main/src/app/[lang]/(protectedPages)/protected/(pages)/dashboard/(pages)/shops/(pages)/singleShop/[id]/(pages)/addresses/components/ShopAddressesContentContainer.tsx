"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { shopAddressesRequests } from "@/requests/ourApi/shopAddressesRequest";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { ShopAddress } from "@/types/ourApiSepecifc/ShopAddress";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useRef, useState } from "react";
import ShopAddressSingleTableRow from "./ShopAddressSingleTableRow";
import CreateShopAddressButtonWithDialog from "./CreateShopAddressButtonWithDialog";

type Props = {
  shopId: number;
  queryParams: DefaultQueryParams;
};

export default function ShopAddressesContentContainer({
  shopId,
}: // queryParams,
Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );

  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [shopAddresses, setShopAddresses] = useState<ShopAddress[]>([]);
  const theShop = useRef(
    authEntity?.vendor?.shops?.find((shop) => shop.id === shopId)
  );
  const isMyShop = theShop.current != undefined && theShop.current != null;

  useEffect(() => {
    async function getData() {
      setIsLoading(true);
      try {
        const response = await shopAddressesRequests.getAddressesForShop({
          shopId,
          privateAxios,
        });
        setShopAddresses(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    }
    if (isMyShop) {
      getData();
    }
    // eslint-disable-next-line
  }, []);

  if (!isMyShop) {
    return <div>Not Authorized</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle
          label="Addresses For Shop"
          postLabel={
            <span className="text-main-color">{theShop.current?.name}</span>
          }
        />
        <CreateShopAddressButtonWithDialog shopId={shopId} />
      </div>
      {isLoading ? (
        <LoadingInDashboard />
      ) : shopAddresses.length == 0 ? (
        <NoDataFound />
      ) : (
        <div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Street</th>
                <th>Notes</th>
                <th>Is Default</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shopAddresses.map((shopAddress) => (
                <ShopAddressSingleTableRow
                  key={shopAddress.id}
                  shopAddress={shopAddress}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
