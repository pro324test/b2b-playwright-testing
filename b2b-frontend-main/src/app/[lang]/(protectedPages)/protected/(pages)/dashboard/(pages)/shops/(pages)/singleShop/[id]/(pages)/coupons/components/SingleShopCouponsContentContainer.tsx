"use client";

import CouponSingleTableRow from "@/components/dashboard/coupons/CouponSingleTableRow";
import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import Pagination from "@/components/globals/Pagination";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { couponsRequests } from "@/requests/ourApi/couponsRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Coupon } from "@/types/ourApiSepecifc/Coupon";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useRef, useState } from "react";
import { FaRegPlusSquare } from "react-icons/fa";
import CreateCouponModal from "@/components/dashboard/coupons/modals/CreateCouponModal";

type Props = {
  shopId: number;
  queryParams: DefaultQueryParams;
};

export default function SingleShopCouponsContentContainer({
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
  const [isCreateCouponModalOpen, setIsCreateCouponModalOpen] = useState(false);

  const [response, setResponse] = useState<PaginatedResponse<Coupon> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchPromotions() {
      setIsLoading(true);
      try {
        const response = await couponsRequests.getShopCoupons({
          privateAxios,
          shopId,
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
      <CreateCouponModal
        isOpen={isCreateCouponModalOpen}
        setIsOpen={setIsCreateCouponModalOpen}
        shop={theShop.current}
        typeOfCreation="single_shop"
      />
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle
          label="Coupons of Shop"
          postLabel={
            <span className="text-main-color">{theShop.current.name}</span>
          }
        />
        <button
          className={
            "py-2 px-6 bg-green-600 text-white flex gap-4 justify-center items-center"
          }
          onClick={() => setIsCreateCouponModalOpen(true)}
        >
          <FaRegPlusSquare />

          <span> Create Coupon</span>
        </button>
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
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((coupon) => (
                <CouponSingleTableRow key={coupon.id} coupon={coupon} />
              ))}
            </tbody>
          </table>

          <div className="my-8">
            <Pagination
              paginatedResponse={response}
              currentParams={queryParams}
            />
          </div>
        </div>
      )}
    </>
  );
}
