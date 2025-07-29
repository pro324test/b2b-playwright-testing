"use client";

import CouponSingleTableRow from "@/components/dashboard/coupons/CouponSingleTableRow";
import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { couponsRequests } from "@/requests/ourApi/couponsRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Coupon } from "@/types/ourApiSepecifc/Coupon";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import CreateCouponsActionsInVendorContent from "./CreateCouponsActionsInVendorContent";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function CouponsVendorContentContainer({}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState<PaginatedResponse<Coupon> | null>(
    null
  );

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const response = await couponsRequests.getVendorCoupons({
          privateAxios,
          vendorId: authEntity?.vendor?.id ?? 0,
        });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupons();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle label="Coupons" />
        <CreateCouponsActionsInVendorContent />
      </div>
      {isLoading ? (
        <LoadingInDashboard />
      ) : (
        <>
          {response == null || response.data.length == 0 ? (
            <NoDataFound />
          ) : (
            <>
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
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
