"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { promotionsRequests } from "@/requests/ourApi/promotionsRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Promotion } from "@/types/ourApiSepecifc/Promotion";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useRef, useState } from "react";
import PromotionSingleTableRow from "./PromotionSingleTableRow";
import PromotionsContentActions from "./PromotionsContentActions";

type Props = {
  shopId: number;
  queryParams: DefaultQueryParams;
};

export default function PromotionsContentContainer({
  shopId,
  queryParams,
}: Props) {
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const theShop = useRef(
    authEntity?.vendor?.shops?.find((shop) => shop.id === shopId)
  );

  const [response, setResponse] = useState<PaginatedResponse<Promotion> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchPromotions() {
      setIsLoading(true);
      try {
        const response = await promotionsRequests.getPromotionsOfShop({
          privateAxios,
          shopId,
          queryParams,
        });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    }
    if (theShop.current) {
      fetchPromotions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!theShop.current) {
    return <div>Shop not found</div>;
  }
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle
          label="Promotions Of Shop "
          postLabel={
            <span className="text-main-color">{theShop.current.name}</span>
          }
        />
        <PromotionsContentActions shop={theShop.current} />
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
                <th>Id</th>
                <th>Name</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((promotion) => (
                <PromotionSingleTableRow
                  key={promotion.id}
                  promotion={promotion}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
